package com.construction.embedded.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.construction.embedded.dto.LoginRequest;
import com.construction.embedded.dto.LoginResponse;
import com.construction.embedded.entity.SysUser;
import com.construction.embedded.exception.BusinessException;
import com.construction.embedded.mapper.SysUserMapper;
import com.construction.embedded.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AuthService {

    @Autowired
    private SysUserMapper sysUserMapper;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    public LoginResponse login(LoginRequest request) {
        LambdaQueryWrapper<SysUser> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(SysUser::getUsername, request.getUsername());
        SysUser user = sysUserMapper.selectOne(wrapper);

        if (user == null) {
            throw new BusinessException("用户名或密码错误");
        }

        if (user.getStatus() == 0) {
            throw new BusinessException("用户已被禁用");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BusinessException("用户名或密码错误");
        }

        String token = jwtUtil.generateToken(user.getId(), user.getUsername());
        List<String> roles = sysUserMapper.selectRoleCodesByUserId(user.getId());

        return new LoginResponse(token, user.getId(), user.getUsername(), user.getRealName(), roles);
    }
}
