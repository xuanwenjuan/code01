package com.zongshi.brush.controller;

import com.zongshi.brush.annotation.OperationLog;
import com.zongshi.brush.common.Result;
import com.zongshi.brush.dto.LoginDTO;
import com.zongshi.brush.service.AuthService;
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
    @OperationLog(module = "认证", type = "登录", description = "用户登录")
    public Result<Map<String, Object>> login(@Valid @RequestBody LoginDTO dto) {
        Map<String, Object> result = authService.login(dto);
        return Result.success("登录成功", result);
    }
}
