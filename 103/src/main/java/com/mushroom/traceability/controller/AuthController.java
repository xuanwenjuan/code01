package com.mushroom.traceability.controller;

import com.mushroom.traceability.common.Result;
import com.mushroom.traceability.dto.LoginDTO;
import com.mushroom.traceability.entity.SysUser;
import com.mushroom.traceability.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public Result<Map<String, Object>> login(@Valid @RequestBody LoginDTO loginDTO) {
        return Result.success(authService.login(loginDTO));
    }

    @PostMapping("/register")
    public Result<SysUser> register(@Valid @RequestBody SysUser user) {
        return Result.success(authService.register(user));
    }
}