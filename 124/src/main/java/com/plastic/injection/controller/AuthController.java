package com.plastic.injection.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.plastic.injection.common.Result;
import com.plastic.injection.context.UserContext;
import com.plastic.injection.dto.LoginDTO;
import com.plastic.injection.entity.SysUser;
import com.plastic.injection.exception.BusinessException;
import com.plastic.injection.mapper.SysUserMapper;
import com.plastic.injection.util.JwtUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
public class AuthController {

    private final SysUserMapper sysUserMapper;
    private final JwtUtil jwtUtil;

    @PostMapping("/login")
    public Result<Map<String, Object>> login(@Valid @RequestBody LoginDTO dto) {
        LambdaQueryWrapper<SysUser> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(SysUser::getUsername, dto.getUsername());
        SysUser user = sysUserMapper.selectOne(wrapper);

        if (user == null) {
            throw new BusinessException("用户不存在");
        }
        if (user.getStatus() != 1) {
            throw new BusinessException("用户已被禁用");
        }

        String token = jwtUtil.generateToken(user.getId(), user.getRealName(), user.getRole());

        Map<String, Object> data = new HashMap<>();
        data.put("token", token);
        data.put("userId", user.getId());
        data.put("username", user.getUsername());
        data.put("realName", user.getRealName());
        data.put("role", user.getRole());

        return Result.success(data);
    }

    @GetMapping("/info")
    public Result<Map<String, Object>> getUserInfo() {
        Map<String, Object> data = new HashMap<>();
        data.put("userId", UserContext.getUserId());
        data.put("username", UserContext.getUsername());
        data.put("role", UserContext.getRole());
        return Result.success(data);
    }
}
