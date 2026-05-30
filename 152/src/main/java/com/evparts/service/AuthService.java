package com.evparts.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.evparts.dto.LoginDTO;
import com.evparts.dto.LoginVO;
import com.evparts.entity.SysUser;
import com.evparts.exception.BusinessException;
import com.evparts.mapper.SysUserMapper;
import com.evparts.utils.JwtUtils;
import cn.hutool.crypto.digest.BCrypt;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
public class AuthService {

    @Autowired
    private SysUserMapper sysUserMapper;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    public LoginVO login(LoginDTO loginDTO) {
        SysUser user = sysUserMapper.selectOne(
                new LambdaQueryWrapper<SysUser>()
                        .eq(SysUser::getUsername, loginDTO.getUsername())
        );

        if (user == null) {
            throw new BusinessException(1001, "用户不存在");
        }

        if (!BCrypt.checkpw(loginDTO.getPassword(), user.getPassword())) {
            throw new BusinessException(1002, "密码错误");
        }

        if (user.getStatus() == 0) {
            throw new BusinessException(1003, "用户已被禁用");
        }

        String role = sysUserMapper.getRoleCodeByUserId(user.getId());
        String token = jwtUtils.generateToken(user.getId(), user.getUsername(), role);

        String redisKey = "user:token:" + user.getId();
        redisTemplate.opsForValue().set(redisKey, token, 24, TimeUnit.HOURS);

        LoginVO loginVO = new LoginVO();
        loginVO.setToken(token);
        loginVO.setUserId(user.getId());
        loginVO.setUsername(user.getUsername());
        loginVO.setRealName(user.getRealName());
        loginVO.setRole(role);

        return loginVO;
    }

    public void logout(Long userId) {
        String redisKey = "user:token:" + userId;
        redisTemplate.delete(redisKey);
    }

}
