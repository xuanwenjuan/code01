package com.fan.impeller.controller;

import com.fan.impeller.common.Result;
import com.fan.impeller.dto.LoginDTO;
import com.fan.impeller.entity.User;
import com.fan.impeller.service.UserService;
import com.fan.impeller.vo.LoginVO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;

    @PostMapping("/login")
    public Result<LoginVO> login(@Valid @RequestBody LoginDTO dto) {
        return Result.success(userService.login(dto));
    }

    @PostMapping("/register")
    public Result<Void> register(@Valid @RequestBody User user) {
        userService.register(user);
        return Result.success();
    }
}