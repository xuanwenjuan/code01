package com.snack.processing.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.snack.processing.annotation.OperationLog;
import com.snack.processing.common.Result;
import com.snack.processing.common.ResultCode;
import com.snack.processing.dto.user.UserAddDTO;
import com.snack.processing.dto.user.UserQueryDTO;
import com.snack.processing.entity.SysUser;
import com.snack.processing.exception.BusinessException;
import com.snack.processing.mapper.SysUserMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class SysUserService extends ServiceImpl<SysUserMapper, SysUser> {

    private final SysUserMapper sysUserMapper;
    private final PasswordEncoder passwordEncoder;

    @OperationLog(module = "用户管理", operation = "新增用户", description = "新增系统用户")
    @Transactional(rollbackFor = Exception.class)
    public Result<Void> addUser(UserAddDTO dto) {
        SysUser exists = sysUserMapper.selectOne(new LambdaQueryWrapper<SysUser>()
                .eq(SysUser::getUsername, dto.getUsername()));

        if (exists != null) {
            throw new BusinessException(ResultCode.USER_EXISTS);
        }

        SysUser user = new SysUser();
        user.setUsername(dto.getUsername());
        user.setPassword(passwordEncoder.encode(dto.getPassword()));
        user.setRealName(dto.getRealName());
        user.setPhone(dto.getPhone());
        user.setEmail(dto.getEmail());
        user.setRole(dto.getRole());
        user.setStatus(dto.getStatus() != null ? dto.getStatus() : 1);
        user.setAvatar(dto.getAvatar());
        user.setRemark(dto.getRemark());

        sysUserMapper.insert(user);
        return Result.success();
    }

    @OperationLog(module = "用户管理", operation = "更新用户", description = "更新系统用户信息")
    @Transactional(rollbackFor = Exception.class)
    public Result<Void> updateUser(Long id, UserAddDTO dto) {
        SysUser user = sysUserMapper.selectById(id);
        if (user == null) {
            throw new BusinessException(ResultCode.DATA_NOT_FOUND);
        }

        SysUser exists = sysUserMapper.selectOne(new LambdaQueryWrapper<SysUser>()
                .eq(SysUser::getUsername, dto.getUsername())
                .ne(SysUser::getId, id));

        if (exists != null) {
            throw new BusinessException(ResultCode.USER_EXISTS);
        }

        user.setUsername(dto.getUsername());
        if (dto.getPassword() != null && !dto.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(dto.getPassword()));
        }
        user.setRealName(dto.getRealName());
        user.setPhone(dto.getPhone());
        user.setEmail(dto.getEmail());
        user.setRole(dto.getRole());
        user.setStatus(dto.getStatus() != null ? dto.getStatus() : user.getStatus());
        user.setAvatar(dto.getAvatar());
        user.setRemark(dto.getRemark());

        sysUserMapper.updateById(user);
        return Result.success();
    }

    @OperationLog(module = "用户管理", operation = "删除用户", description = "删除系统用户")
    @Transactional(rollbackFor = Exception.class)
    public Result<Void> deleteUser(Long id) {
        SysUser user = sysUserMapper.selectById(id);
        if (user == null) {
            throw new BusinessException(ResultCode.DATA_NOT_FOUND);
        }

        sysUserMapper.deleteById(id);
        return Result.success();
    }

    @OperationLog(module = "用户管理", operation = "禁用用户", description = "禁用系统用户")
    @Transactional(rollbackFor = Exception.class)
    public Result<Void> disableUser(Long id) {
        SysUser user = sysUserMapper.selectById(id);
        if (user == null) {
            throw new BusinessException(ResultCode.DATA_NOT_FOUND);
        }

        user.setStatus(0);
        sysUserMapper.updateById(user);
        return Result.success();
    }

    @OperationLog(module = "用户管理", operation = "启用用户", description = "启用系统用户")
    @Transactional(rollbackFor = Exception.class)
    public Result<Void> enableUser(Long id) {
        SysUser user = sysUserMapper.selectById(id);
        if (user == null) {
            throw new BusinessException(ResultCode.DATA_NOT_FOUND);
        }

        user.setStatus(1);
        sysUserMapper.updateById(user);
        return Result.success();
    }

    public Result<SysUser> getUserById(Long id) {
        SysUser user = sysUserMapper.selectById(id);
        if (user == null) {
            throw new BusinessException(ResultCode.DATA_NOT_FOUND);
        }
        user.setPassword(null);
        return Result.success(user);
    }

    public Result<IPage<SysUser>> getUserPage(UserQueryDTO dto) {
        LambdaQueryWrapper<SysUser> wrapper = new LambdaQueryWrapper<>();
        wrapper.like(dto.getUsername() != null, SysUser::getUsername, dto.getUsername())
                .like(dto.getRealName() != null, SysUser::getRealName, dto.getRealName())
                .like(dto.getPhone() != null, SysUser::getPhone, dto.getPhone())
                .eq(dto.getRole() != null, SysUser::getRole, dto.getRole())
                .eq(dto.getStatus() != null, SysUser::getStatus, dto.getStatus())
                .orderByDesc(SysUser::getCreateTime);

        IPage<SysUser> page = sysUserMapper.selectPage(dto.buildPage(), wrapper);
        page.getRecords().forEach(u -> u.setPassword(null));
        return Result.success(page);
    }

    public Result<List<SysUser>> getUsersByRole(Integer role) {
        List<SysUser> list = sysUserMapper.selectList(new LambdaQueryWrapper<SysUser>()
                .eq(SysUser::getRole, role)
                .eq(SysUser::getStatus, 1)
                .orderByAsc(SysUser::getRealName));
        list.forEach(u -> u.setPassword(null));
        return Result.success(list);
    }
}
