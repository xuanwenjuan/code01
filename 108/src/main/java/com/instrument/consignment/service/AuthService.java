package com.instrument.consignment.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.instrument.consignment.dto.LoginDTO;
import com.instrument.consignment.dto.LoginRespDTO;
import com.instrument.consignment.entity.SysUser;
import com.instrument.consignment.exception.BusinessException;
import com.instrument.consignment.mapper.SysUserMapper;
import com.instrument.consignment.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final SysUserMapper sysUserMapper;
    private final JwtUtil jwtUtil;

    public LoginRespDTO login(LoginDTO loginDTO) {
        SysUser user = sysUserMapper.selectOne(
                new LambdaQueryWrapper<SysUser>()
                        .eq(SysUser::getUsername, loginDTO.getUsername())
        );

        if (user == null) {
            throw new BusinessException("用户名或密码错误");
        }

        if (user.getStatus() != 1) {
            throw new BusinessException("用户已被禁用");
        }

        if (!loginDTO.getPassword().equals(user.getPassword())) {
            throw new BusinessException("用户名或密码错误");
        }

        String token = jwtUtil.generateToken(user.getId(), user.getUsername(), user.getRole());

        return LoginRespDTO.builder()
                .userId(user.getId())
                .username(user.getUsername())
                .realName(user.getRealName())
                .role(user.getRole())
                .token(token)
                .build();
    }
}
