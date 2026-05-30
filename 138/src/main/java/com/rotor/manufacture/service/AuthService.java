package com.rotor.manufacture.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.rotor.manufacture.common.ResultCodeEnum;
import com.rotor.manufacture.dto.LoginDTO;
import com.rotor.manufacture.entity.User;
import com.rotor.manufacture.exception.BusinessException;
import com.rotor.manufacture.mapper.UserMapper;
import com.rotor.manufacture.util.JwtUtil;
import com.rotor.manufacture.vo.LoginVO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.DigestUtils;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserMapper userMapper;
    private final JwtUtil jwtUtil;

    public LoginVO login(LoginDTO loginDTO) {
        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(User::getUsername, loginDTO.getUsername());
        User user = userMapper.selectOne(wrapper);

        if (user == null) {
            throw new BusinessException(ResultCodeEnum.USER_NOT_FOUND);
        }

        String md5Password = DigestUtils.md5DigestAsHex(loginDTO.getPassword().getBytes());
        if (!md5Password.equals(user.getPassword())) {
            throw new BusinessException(ResultCodeEnum.USER_PASSWORD_ERROR);
        }

        if (user.getStatus() != 1) {
            throw new BusinessException(ResultCodeEnum.USER_DISABLED);
        }

        String token = jwtUtil.generateToken(user.getId(), user.getUsername(), user.getRole());

        LoginVO loginVO = new LoginVO();
        loginVO.setUserId(user.getId());
        loginVO.setUsername(user.getUsername());
        loginVO.setRealName(user.getRealName());
        loginVO.setRole(user.getRole());
        loginVO.setToken(token);

        return loginVO;
    }

    public void initAdmin() {
        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(User::getUsername, "admin");
        if (userMapper.selectCount(wrapper) > 0) {
            return;
        }

        User admin = new User();
        admin.setUsername("admin");
        admin.setPassword(DigestUtils.md5DigestAsHex("123456".getBytes()));
        admin.setRealName("管理员");
        admin.setRole("ADMIN");
        admin.setStatus(1);
        userMapper.insert(admin);
    }
}