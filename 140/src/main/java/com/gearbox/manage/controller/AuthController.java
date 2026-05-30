package com.gearbox.manage.controller;

import com.gearbox.manage.common.Result;
import com.gearbox.manage.dto.LoginDTO;
import com.gearbox.manage.service.AuthService;
import com.gearbox.manage.vo.LoginVO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public Result<LoginVO> login(@Valid @RequestBody LoginDTO dto) {
        return Result.success(authService.login(dto));
    }
}
