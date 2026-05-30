package com.cosmetics.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.cosmetics.common.ResultCode;
import com.cosmetics.dto.LoginDTO;
import com.cosmetics.entity.User;
import com.cosmetics.enums.UserRoleEnum;
import com.cosmetics.exception.BusinessException;
import com.cosmetics.mapper.UserMapper;
import com.cosmetics.service.AuthService;
import com.cosmetics.util.JwtUtil;
import com.cosmetics.vo.LoginVO;
import lombok.RequiredArgsConstructor;
import cn.hutool.crypto.digest.BCrypt;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserMapper userMapper;
    private final JwtUtil jwtUtil;
    private final RedisTemplate<String, Object> redisTemplate;

    @Override
    public LoginVO login(LoginDTO loginDTO) {
        User user = userMapper.selectOne(new LambdaQueryWrapper<User>()
                .eq(User::getUsername, loginDTO.getUsername()));

        if (user == null) {
            throw new BusinessException(ResultCode.LOGIN_ERROR);
        }

        if (user.getStatus() == 0) {
            throw new BusinessException(ResultCode.USER_DISABLED);
        }

        if (!BCrypt.checkpw(loginDTO.getPassword(), user.getPassword())) {
            throw new BusinessException(ResultCode.LOGIN_ERROR);
        }

        String token = jwtUtil.generateToken(user.getId(), user.getUsername(), user.getRole());

        redisTemplate.opsForValue().set("token:" + user.getId(), token, 24, TimeUnit.HOURS);

        LoginVO loginVO = new LoginVO();
        loginVO.setToken(token);
        loginVO.setUserId(user.getId());
        loginVO.setUsername(user.getUsername());
        loginVO.setRealName(user.getRealName());
        loginVO.setRole(user.getRole());
        UserRoleEnum roleEnum = UserRoleEnum.getByCode(user.getRole());
        loginVO.setRoleDesc(roleEnum != null ? roleEnum.getDesc() : "未知角色");

        return loginVO;
    }

    @Override
    public void logout() {
        Long userId = com.cosmetics.context.UserContext.getUserId();
        if (userId != null) {
            redisTemplate.delete("token:" + userId);
        }
    }
}
