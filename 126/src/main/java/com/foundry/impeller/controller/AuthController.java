package com.foundry.impeller.controller;

import com.foundry.impeller.common.Result;
import com.foundry.impeller.dto.LoginDTO;
import com.foundry.impeller.entity.User;
import com.foundry.impeller.service.AuthService;
import com.foundry.impeller.vo.LoginVO;
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

    private final AuthService authService;

    @PostMapping("/login")
    public Result<LoginVO> login(@Valid @RequestBody LoginDTO loginDTO) {
        LoginVO loginVO = authService.login(loginDTO);
        return Result.success(loginVO);
    }

    @PostMapping("/register")
    public Result<Void> register(@Valid @RequestBody User user) {
        authService.register(user);
        return Result.success();
    }
}
