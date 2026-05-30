package com.gear.mfg.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.gear.mfg.dto.LoginDTO;
import com.gear.mfg.entity.User;
import com.gear.mfg.exception.BusinessException;
import com.gear.mfg.mapper.UserMapper;
import com.gear.mfg.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserMapper userMapper;
    private final JwtUtil jwtUtil;

    public Map<String, Object> login(LoginDTO loginDTO) {
        User user = userMapper.selectOne(
                new LambdaQueryWrapper<User>()
                        .eq(User::getUsername, loginDTO.getUsername())
        );

        if (user == null) {
            throw new BusinessException("用户不存在");
        }

        if (!loginDTO.getPassword().equals(user.getPassword())) {
            throw new BusinessException("密码错误");
        }

        if (user.getStatus() != 1) {
            throw new BusinessException("用户已被禁用");
        }

        String token = jwtUtil.generateToken(user.getId(), user.getUsername(), user.getRole());

        Map<String, Object> result = new HashMap<>();
        result.put("token", token);
        result.put("userId", user.getId());
        result.put("username", user.getUsername());
        result.put("realName", user.getRealName());
        result.put("role", user.getRole());

        return result;
    }
}