package com.hardware.stamping.controller;

import com.hardware.stamping.common.Result;
import com.hardware.stamping.dto.LoginDTO;
import com.hardware.stamping.entity.SysUser;
import com.hardware.stamping.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public Result<Map<String, Object>> login(@Valid @RequestBody LoginDTO loginDTO) {
        return Result.success(authService.login(loginDTO));
    }

    @PostMapping("/register")
    public Result<Void> register(@Valid @RequestBody SysUser user) {
        authService.register(user);
        return Result.success();
    }
}
