package com.bearing.production.controller;

import com.bearing.production.common.Result;
import com.bearing.production.dto.LoginDTO;
import com.bearing.production.entity.User;
import com.bearing.production.service.AuthService;
import com.bearing.production.vo.LoginVO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public Result<LoginVO> login(@Valid @RequestBody LoginDTO loginDTO) {
        LoginVO loginVO = authService.login(loginDTO);
        return Result.success("登录成功", loginVO);
    }

    @PostMapping("/register")
    public Result<Void> register(@Valid @RequestBody User user) {
        authService.register(user);
        return Result.success("注册成功", null);
    }
}
