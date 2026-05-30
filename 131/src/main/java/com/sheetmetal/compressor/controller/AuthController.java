package com.sheetmetal.compressor.controller;

import com.sheetmetal.compressor.common.Result;
import com.sheetmetal.compressor.dto.LoginDTO;
import com.sheetmetal.compressor.dto.LoginVO;
import com.sheetmetal.compressor.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public Result<LoginVO> login(@Valid @RequestBody LoginDTO dto) {
        return Result.success(authService.login(dto));
    }
}
