package com.paper.production.service.system.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.paper.production.common.ResultCode;
import com.paper.production.dto.system.LoginDTO;
import com.paper.production.dto.system.UserRegisterDTO;
import com.paper.production.entity.system.User;
import com.paper.production.enums.RoleEnum;
import com.paper.production.exception.BusinessException;
import com.paper.production.mapper.system.UserMapper;
import com.paper.production.utils.JwtUtil;
import com.paper.production.utils.UserContextUtil;
import jakarta.annotation.Resource;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class UserServiceImpl extends ServiceImpl<UserMapper, User> implements UserService {

    @Resource
    private JwtUtil jwtUtil;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Override
    public Map<String, Object> login(LoginDTO loginDTO) {
        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(User::getUsername, loginDTO.getUsername());
        User user = getOne(wrapper);

        if (user == null) {
            throw new BusinessException(ResultCode.USER_NOT_EXIST);
        }

        if (user.getStatus() == 0) {
            throw new BusinessException(ResultCode.USER_DISABLED);
        }

        if (!passwordEncoder.matches(loginDTO.getPassword(), user.getPassword())) {
            throw new BusinessException(ResultCode.USER_PASSWORD_ERROR);
        }

        String token = jwtUtil.generateToken(user.getId(), user.getUsername(), user.getRole());

        Map<String, Object> result = new HashMap<>();
        result.put("token", token);
        result.put("userId", user.getId());
        result.put("username", user.getUsername());
        result.put("nickname", user.getNickname());
        result.put("role", user.getRole());
        result.put("roleName", RoleEnum.getByCode(user.getRole()) != null ? RoleEnum.getByCode(user.getRole()).getName() : "");

        return result;
    }

    @Override
    public void register(UserRegisterDTO registerDTO) {
        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(User::getUsername, registerDTO.getUsername());
        if (count(wrapper) > 0) {
            throw new BusinessException(ResultCode.USERNAME_ALREADY_EXIST);
        }

        if (RoleEnum.getByCode(registerDTO.getRole()) == null) {
            throw new BusinessException("角色不存在");
        }

        User user = new User();
        user.setUsername(registerDTO.getUsername());
        user.setPassword(passwordEncoder.encode(registerDTO.getPassword()));
        user.setNickname(registerDTO.getNickname());
        user.setPhone(registerDTO.getPhone());
        user.setEmail(registerDTO.getEmail());
        user.setRole(registerDTO.getRole());
        user.setStatus(1);

        save(user);
    }

    @Override
    public User getUserInfo() {
        Long userId = UserContextUtil.getUserId();
        User user = getById(userId);
        if (user == null) {
            throw new BusinessException(ResultCode.USER_NOT_EXIST);
        }
        user.setPassword(null);
        return user;
    }
}
