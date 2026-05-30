package com.spring.manufacturing.controller;

import com.spring.manufacturing.annotation.OperationLog;
import com.spring.manufacturing.common.Result;
import com.spring.manufacturing.dto.LoginDTO;
import com.spring.manufacturing.entity.SysUser;
import com.spring.manufacturing.service.SysUserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final SysUserService sysUserService;

    @PostMapping("/login")
    @OperationLog(module = "认证授权", type = "登录", description = "用户登录")
    public Result<Map<String, Object>> login(@Valid @RequestBody LoginDTO loginDTO) {
        Map<String, Object> result = sysUserService.login(loginDTO);
        return Result.success("登录成功", result);
    }

    @PostMapping("/register")
    @OperationLog(module = "认证授权", type = "注册", description = "用户注册")
    public Result<Void> register(@Valid @RequestBody SysUser user) {
        sysUserService.register(user);
        return Result.success("注册成功", null);
    }

    @GetMapping("/info")
    public Result<SysUser> getUserInfo(@RequestHeader("Authorization") String token) {
        String actualToken = token.startsWith("Bearer ") ? token.substring(7) : token;
        Long userId = Long.valueOf(sysUserService.getUserIdFromToken(actualToken).toString());
        SysUser user = sysUserService.getById(userId);
        user.setPassword(null);
        return Result.success(user);
    }
}