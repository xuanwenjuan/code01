package com.valve.manufacture.controller;

import com.valve.manufacture.common.Result;
import com.valve.manufacture.dto.LoginDTO;
import com.valve.manufacture.entity.User;
import com.valve.manufacture.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;

    @PostMapping("/login")
    public Result<Map<String, Object>> login(@Valid @RequestBody LoginDTO loginDTO) {
        Map<String, Object> result = userService.login(loginDTO);
        return Result.success("登录成功", result);
    }

    @PostMapping("/register")
    public Result<User> register(@Valid @RequestBody User user) {
        User savedUser = userService.register(user);
        savedUser.setPassword(null);
        return Result.success("注册成功", savedUser);
    }
}
