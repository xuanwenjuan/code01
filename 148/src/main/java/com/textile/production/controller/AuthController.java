package com.textile.production.controller;

import com.textile.production.common.Result;
import com.textile.production.dto.LoginDTO;
import com.textile.production.entity.SysUser;
import com.textile.production.service.AuthService;
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
    public Result<Map<String, Object>> login(@Valid @RequestBody LoginDTO loginDTO) {
        return authService.login(loginDTO);
    }

    @GetMapping("/user-info")
    public Result<SysUser> getUserInfo() {
        return authService.getCurrentUser();
    }
}
