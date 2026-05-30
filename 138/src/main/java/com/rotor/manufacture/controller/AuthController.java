package com.rotor.manufacture.controller;

import com.rotor.manufacture.common.Result;
import com.rotor.manufacture.dto.LoginDTO;
import com.rotor.manufacture.service.AuthService;
import com.rotor.manufacture.vo.LoginVO;
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
        return Result.success(loginVO);
    }
}