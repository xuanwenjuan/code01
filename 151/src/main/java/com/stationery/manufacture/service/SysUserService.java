package com.stationery.manufacture.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.stationery.manufacture.common.BusinessException;
import com.stationery.manufacture.common.ErrorCode;
import com.stationery.manufacture.entity.SysUser;
import com.stationery.manufacture.mapper.SysUserMapper;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class SysUserService {

    private final SysUserMapper userMapper;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public SysUserService(SysUserMapper userMapper) {
        this.userMapper = userMapper;
    }

    @Transactional(rollbackFor = Exception.class)
    public void addUser(SysUser user) {
        Long count = userMapper.selectCount(new LambdaQueryWrapper<SysUser>()
                .eq(SysUser::getUsername, user.getUsername()));
        if (count > 0) {
            throw new BusinessException(ErrorCode.DATA_EXISTS);
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setCreateTime(LocalDateTime.now());
        user.setUpdateTime(LocalDateTime.now());
        if (user.getStatus() == null) {
            user.setStatus(1);
        }
        userMapper.insert(user);
    }

    @Transactional(rollbackFor = Exception.class)
    public void updateUser(SysUser user) {
        SysUser exist = userMapper.selectById(user.getId());
        if (exist == null) {
            throw new BusinessException(ErrorCode.DATA_NOT_EXISTS);
        }

        if (!exist.getUsername().equals(user.getUsername())) {
            Long count = userMapper.selectCount(new LambdaQueryWrapper<SysUser>()
                    .eq(SysUser::getUsername, user.getUsername()));
            if (count > 0) {
                throw new BusinessException(ErrorCode.DATA_EXISTS);
            }
        }

        if (StringUtils.hasText(user.getPassword())) {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        } else {
            user.setPassword(null);
        }

        user.setUpdateTime(LocalDateTime.now());
        userMapper.updateById(user);
    }

    @Transactional(rollbackFor = Exception.class)
    public void deleteUser(Long id) {
        userMapper.deleteById(id);
    }

    public SysUser getUserById(Long id) {
        return userMapper.selectById(id);
    }

    public Page<SysUser> getUserPage(Integer pageNum, Integer pageSize,
                                     String username, String realName,
                                     String roleCode, Integer status) {
        Page<SysUser> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<SysUser> wrapper = new LambdaQueryWrapper<>();

        if (StringUtils.hasText(username)) {
            wrapper.like(SysUser::getUsername, username);
        }
        if (StringUtils.hasText(realName)) {
            wrapper.like(SysUser::getRealName, realName);
        }
        if (StringUtils.hasText(roleCode)) {
            wrapper.eq(SysUser::getRoleCode, roleCode);
        }
        if (status != null) {
            wrapper.eq(SysUser::getStatus, status);
        }

        wrapper.orderByDesc(SysUser::getCreateTime);
        return userMapper.selectPage(page, wrapper);
    }

    public List<SysUser> getUserByRole(String roleCode) {
        return userMapper.selectList(new LambdaQueryWrapper<SysUser>()
                .eq(SysUser::getRoleCode, roleCode)
                .eq(SysUser::getStatus, 1)
                .orderByAsc(SysUser::getId));
    }

    public List<SysUser> getAllActiveUsers() {
        return userMapper.selectList(new LambdaQueryWrapper<SysUser>()
                .eq(SysUser::getStatus, 1)
                .orderByAsc(SysUser::getId));
    }

    @Transactional(rollbackFor = Exception.class)
    public void updateStatus(Long id, Integer status) {
        userMapper.update(null, new LambdaQueryWrapper<SysUser>()
                .eq(SysUser::getId, id)
                .set(SysUser::getStatus, status)
                .set(SysUser::getUpdateTime, LocalDateTime.now()));
    }
}
