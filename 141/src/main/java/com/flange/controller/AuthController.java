package com.flange.controller;

import com.flange.common.Result;
import com.flange.dto.LoginDto;
import com.flange.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public Result<Map<String, Object>> login(@Valid @RequestBody LoginDto loginDto) {
        Map<String, Object> result = authService.login(loginDto);
        return Result.success(result);
    }
}
