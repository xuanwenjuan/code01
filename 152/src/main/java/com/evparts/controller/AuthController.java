package com.evparts.controller;

import com.evparts.annotation.OperationLog;
import com.evparts.common.Result;
import com.evparts.dto.LoginDTO;
import com.evparts.dto.LoginVO;
import com.evparts.service.AuthService;
import com.evparts.utils.UserContext;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@Tag(name = "认证管理", description = "用户登录、登出接口")
@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Operation(summary = "用户登录")
    @OperationLog(operation = "用户登录")
    @PostMapping("/login")
    public Result<LoginVO> login(@Valid @RequestBody LoginDTO loginDTO) {
        return Result.success(authService.login(loginDTO));
    }

    @Operation(summary = "用户登出")
    @OperationLog(operation = "用户登出")
    @PostMapping("/logout")
    public Result<Void> logout() {
        Long userId = UserContext.getUserId();
        authService.logout(userId);
        return Result.success();
    }

    @Operation(summary = "获取当前用户信息")
    @GetMapping("/current")
    public Result<UserContext.UserInfo> getCurrentUser() {
        return Result.success(UserContext.getUser());
    }

}
