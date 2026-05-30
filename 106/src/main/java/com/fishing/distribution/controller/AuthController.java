package com.fishing.distribution.controller;

import com.fishing.distribution.common.Result;
import com.fishing.distribution.dto.LoginRequest;
import com.fishing.distribution.entity.SysUser;
import com.fishing.distribution.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public Result<Map<String, Object>> login(@Valid @RequestBody LoginRequest loginRequest) {
        Map<String, Object> result = authService.login(loginRequest);
        return Result.success("登录成功", result);
    }

    @PostMapping("/logout")
    public Result<Void> logout() {
        SecurityContextHolder.clearContext();
        return Result.success("退出成功");
    }

    @GetMapping("/user-info")
    public Result<Map<String, Object>> getUserInfo() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return Result.unauthorized();
        }

        Long userId = (Long) authentication.getDetails();
        SysUser user = authService.getUserInfo(userId);
        List<String> roles = authService.getUserRoles(userId);

        Map<String, Object> result = new HashMap<>();
        result.put("userId", user.getId());
        result.put("username", user.getUsername());
        result.put("realName", user.getRealName());
        result.put("phone", user.getPhone());
        result.put("email", user.getEmail());
        result.put("roles", roles);

        return Result.success(result);
    }
}
