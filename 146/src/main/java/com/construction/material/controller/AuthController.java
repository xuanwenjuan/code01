package com.construction.material.controller;

import com.construction.material.annotation.OperationLog;
import com.construction.material.common.Result;
import com.construction.material.dto.LoginDTO;
import com.construction.material.dto.SysUserDTO;
import com.construction.material.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    @OperationLog(module = "认证模块", operation = "用户登录", description = "用户登录系统")
    public Result<Map<String, Object>> login(@Valid @RequestBody LoginDTO loginDTO) {
        return Result.success(authService.login(loginDTO));
    }

    @PostMapping("/register")
    @OperationLog(module = "认证模块", operation = "用户注册", description = "新用户注册")
    public Result<Void> register(@Valid @RequestBody SysUserDTO userDTO) {
        authService.register(userDTO);
        return Result.success();
    }
}
