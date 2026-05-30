package com.textile.production.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.textile.production.common.Result;
import com.textile.production.common.ResultCode;
import com.textile.production.dto.LoginDTO;
import com.textile.production.entity.SysUser;
import com.textile.production.exception.BusinessException;
import com.textile.production.mapper.SysUserMapper;
import com.textile.production.utils.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthService extends ServiceImpl<SysUserMapper, SysUser> {

    private final JwtUtil jwtUtil;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public Result<Map<String, Object>> login(LoginDTO loginDTO) {
        LambdaQueryWrapper<SysUser> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(SysUser::getUsername, loginDTO.getUsername());
        SysUser user = getOne(wrapper);

        if (user == null) {
            throw new BusinessException(ResultCode.LOGIN_ERROR);
        }

        if (user.getStatus() == 0) {
            throw new BusinessException(ResultCode.USER_DISABLED);
        }

        if (!passwordEncoder.matches(loginDTO.getPassword(), user.getPassword())) {
            throw new BusinessException(ResultCode.LOGIN_ERROR);
        }

        String token = jwtUtil.generateToken(user.getId(), user.getUsername(), user.getRole());

        Map<String, Object> data = new HashMap<>();
        data.put("token", token);
        data.put("userId", user.getId());
        data.put("username", user.getUsername());
        data.put("realName", user.getRealName());
        data.put("role", user.getRole());

        return Result.success("登录成功", data);
    }

    public Result<SysUser> getCurrentUser() {
        Long userId = com.textile.production.context.UserContext.getUserId();
        SysUser user = getById(userId);
        user.setPassword(null);
        return Result.success(user);
    }
}
