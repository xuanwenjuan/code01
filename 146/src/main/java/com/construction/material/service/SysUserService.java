package com.construction.material.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.construction.material.common.PageQuery;
import com.construction.material.common.PageResult;
import com.construction.material.common.UserContext;
import com.construction.material.dto.SysUserDTO;
import com.construction.material.entity.SysUser;
import com.construction.material.exception.BusinessException;
import com.construction.material.mapper.SysUserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SysUserService {

    private final SysUserMapper sysUserMapper;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Transactional(rollbackFor = Exception.class)
    public void addUser(SysUserDTO dto) {
        LambdaQueryWrapper<SysUser> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(SysUser::getUsername, dto.getUsername())
                .eq(SysUser::getDeleted, 0);
        if (sysUserMapper.selectCount(wrapper) > 0) {
            throw new BusinessException("用户名已存在");
        }

        SysUser user = new SysUser();
        user.setUsername(dto.getUsername());
        user.setPassword(passwordEncoder.encode(dto.getPassword()));
        user.setRealName(dto.getRealName());
        user.setPhone(dto.getPhone());
        user.setEmail(dto.getEmail());
        user.setRole(dto.getRole());
        user.setRoleName(getRoleName(dto.getRole()));
        user.setStatus(dto.getStatus() != null ? dto.getStatus() : 1);
        user.setRemark(dto.getRemark());

        sysUserMapper.insert(user);
    }

    @Transactional(rollbackFor = Exception.class)
    public void updateUser(SysUserDTO dto) {
        SysUser user = sysUserMapper.selectById(dto.getId());
        if (user == null) {
            throw new BusinessException("用户不存在");
        }

        LambdaQueryWrapper<SysUser> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(SysUser::getUsername, dto.getUsername())
                .ne(SysUser::getId, dto.getId())
                .eq(SysUser::getDeleted, 0);
        if (sysUserMapper.selectCount(wrapper) > 0) {
            throw new BusinessException("用户名已存在");
        }

        user.setUsername(dto.getUsername());
        if (StringUtils.hasText(dto.getPassword())) {
            user.setPassword(passwordEncoder.encode(dto.getPassword()));
        }
        user.setRealName(dto.getRealName());
        user.setPhone(dto.getPhone());
        user.setEmail(dto.getEmail());
        user.setRole(dto.getRole());
        user.setRoleName(getRoleName(dto.getRole()));
        user.setStatus(dto.getStatus());
        user.setRemark(dto.getRemark());

        sysUserMapper.updateById(user);
    }

    @Transactional(rollbackFor = Exception.class)
    public void deleteUser(Long id) {
        SysUser user = sysUserMapper.selectById(id);
        if (user == null) {
            throw new BusinessException("用户不存在");
        }
        if (user.getId().equals(UserContext.getUserId())) {
            throw new BusinessException("不能删除当前登录用户");
        }
        sysUserMapper.deleteById(id);
    }

    public SysUser getUser(Long id) {
        SysUser user = sysUserMapper.selectById(id);
        if (user != null) {
            user.setPassword(null);
        }
        return user;
    }

    public PageResult<SysUser> getUserPage(PageQuery pageQuery, String role, Integer status) {
        LambdaQueryWrapper<SysUser> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(pageQuery.getKeyword())) {
            wrapper.like(SysUser::getUsername, pageQuery.getKeyword())
                    .or()
                    .like(SysUser::getRealName, pageQuery.getKeyword())
                    .or()
                    .like(SysUser::getPhone, pageQuery.getKeyword());
        }
        if (StringUtils.hasText(role)) {
            wrapper.eq(SysUser::getRole, role);
        }
        if (status != null) {
            wrapper.eq(SysUser::getStatus, status);
        }
        wrapper.eq(SysUser::getDeleted, 0);
        wrapper.orderByDesc(SysUser::getCreateTime);

        Page<SysUser> page = new Page<>(pageQuery.getPageNum(), pageQuery.getPageSize());
        IPage<SysUser> result = sysUserMapper.selectPage(page, wrapper);

        result.getRecords().forEach(user -> user.setPassword(null));

        return new PageResult<>(result.getRecords(), result.getTotal(),
                (int) result.getCurrent(), (int) result.getSize());
    }

    @Transactional(rollbackFor = Exception.class)
    public void updateStatus(Long id, Integer status) {
        SysUser user = sysUserMapper.selectById(id);
        if (user == null) {
            throw new BusinessException("用户不存在");
        }
        if (user.getId().equals(UserContext.getUserId()) && status == 0) {
            throw new BusinessException("不能禁用当前登录用户");
        }
        user.setStatus(status);
        sysUserMapper.updateById(user);
    }

    @Transactional(rollbackFor = Exception.class)
    public void updatePassword(Long id, String oldPassword, String newPassword) {
        SysUser user = sysUserMapper.selectById(id);
        if (user == null) {
            throw new BusinessException("用户不存在");
        }

        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new BusinessException("原密码错误");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        sysUserMapper.updateById(user);
    }

    public List<Map<String, Object>> getRoleList() {
        return List.of(
                Map.of("role", "ADMIN", "roleName", "系统管理员", "description", "拥有全部权限"),
                Map.of("role", "PURCHASER", "roleName", "采购专员", "description", "负责品类管理、采购入库"),
                Map.of("role", "WAREHOUSE_KEEPER", "roleName", "工地仓管", "description", "负责库存管理、出入库操作"),
                Map.of("role", "SUPERVISOR", "roleName", "工程监理", "description", "负责工单审核、核销"),
                Map.of("role", "FINANCE", "roleName", "财务核算", "description", "负责成本统计、财务对账")
        );
    }

    private String getRoleName(String role) {
        return switch (role) {
            case "ADMIN" -> "系统管理员";
            case "PURCHASER" -> "采购专员";
            case "WAREHOUSE_KEEPER" -> "工地仓管";
            case "SUPERVISOR" -> "工程监理";
            case "FINANCE" -> "财务核算";
            default -> "未知角色";
        };
    }
}
