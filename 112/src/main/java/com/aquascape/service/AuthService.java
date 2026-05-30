package com.aquascape.service;

import com.aquascape.dto.LoginDTO;
import com.aquascape.entity.User;
import com.aquascape.exception.BusinessException;
import com.aquascape.mapper.UserMapper;
import com.aquascape.util.JwtUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class AuthService {

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private JwtUtil jwtUtil;

    public Map<String, Object> login(LoginDTO dto) {
        User user = userMapper.selectOne(
                new LambdaQueryWrapper<User>()
                        .eq(User::getUsername, dto.getUsername())
        );

        if (user == null) {
            throw new BusinessException("用户不存在");
        }

        if (!dto.getPassword().equals(user.getPassword())) {
            throw new BusinessException("密码错误");
        }

        if (user.getStatus() == 0) {
            throw new BusinessException("用户已禁用");
        }

        String token = jwtUtil.generateToken(user.getId(), user.getUsername(), user.getRoleId());

        Map<String, Object> result = new HashMap<>();
        result.put("token", token);
        result.put("userId", user.getId());
        result.put("username", user.getUsername());
        result.put("realName", user.getRealName());
        result.put("roleId", user.getRoleId());

        return result;
    }
}
