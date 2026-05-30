package com.hardware.stamping.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.hardware.stamping.dto.LoginDTO;
import com.hardware.stamping.entity.SysRole;
import com.hardware.stamping.entity.SysUser;
import com.hardware.stamping.exception.BusinessException;
import com.hardware.stamping.mapper.SysRoleMapper;
import com.hardware.stamping.mapper.SysUserMapper;
import com.hardware.stamping.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.DigestUtils;

import java.util.HashMap;
import java.util.Map;

@Service
public class AuthService {

    @Autowired
    private SysUserMapper sysUserMapper;

    @Autowired
    private SysRoleMapper sysRoleMapper;

    @Autowired
    private JwtUtil jwtUtil;

    public Map<String, Object> login(LoginDTO loginDTO) {
        SysUser user = sysUserMapper.selectOne(
                new LambdaQueryWrapper<SysUser>()
                        .eq(SysUser::getUsername, loginDTO.getUsername())
        );

        if (user == null) {
            throw new BusinessException("用户不存在");
        }

        String md5Password = DigestUtils.md5DigestAsHex(loginDTO.getPassword().getBytes());
        if (!md5Password.equals(user.getPassword())) {
            throw new BusinessException("密码错误");
        }

        if (user.getStatus() != 1) {
            throw new BusinessException("用户已被禁用");
        }

        SysRole role = sysRoleMapper.selectById(user.getRoleId());
        String token = jwtUtil.generateToken(user.getId(), user.getUsername(), role.getRoleCode());

        Map<String, Object> result = new HashMap<>();
        result.put("token", token);
        result.put("userId", user.getId());
        result.put("username", user.getUsername());
        result.put("realName", user.getRealName());
        result.put("role", role.getRoleCode());
        result.put("roleName", role.getRoleName());

        return result;
    }

    public void register(SysUser user) {
        SysUser existUser = sysUserMapper.selectOne(
                new LambdaQueryWrapper<SysUser>()
                        .eq(SysUser::getUsername, user.getUsername())
        );

        if (existUser != null) {
            throw new BusinessException("用户名已存在");
        }

        user.setPassword(DigestUtils.md5DigestAsHex(user.getPassword().getBytes()));
        user.setStatus(1);
        sysUserMapper.insert(user);
    }
}
