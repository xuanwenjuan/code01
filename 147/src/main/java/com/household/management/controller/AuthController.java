package com.household.management.controller;

import com.household.management.common.annotation.OperationLog;
import com.household.management.common.result.Result;
import com.household.management.common.utils.JwtUtil;
import com.household.management.dto.LoginDTO;
import com.household.management.service.AuthService;
import com.household.management.vo.LoginVO;
import com.household.management.vo.UserInfoVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@Tag(name = "认证管理")
@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;
    private final JwtUtil jwtUtil;

    public AuthController(AuthService authService, JwtUtil jwtUtil) {
        this.authService = authService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/login")
    @Operation(summary = "用户登录")
    @OperationLog(module = "认证管理", operation = "用户登录")
    public Result<LoginVO> login(@Valid @RequestBody LoginDTO loginDTO) {
        return Result.success(authService.login(loginDTO));
    }

    @GetMapping("/user-info")
    @Operation(summary = "获取用户信息")
    public Result<UserInfoVO> getUserInfo(HttpServletRequest request) {
        String token = request.getHeader(jwtUtil.getHeader());
        if (token != null && token.startsWith(jwtUtil.getPrefix())) {
            token = token.substring(jwtUtil.getPrefix().length());
            Long userId = jwtUtil.getUserIdFromToken(token);
            if (userId != null) {
                return Result.success(authService.getUserInfo(userId));
            }
        }
        return Result.success(null);
    }

    @PostMapping("/logout")
    @Operation(summary = "用户登出")
    @OperationLog(module = "认证管理", operation = "用户登出")
    public Result<Void> logout() {
        return Result.success();
    }
}
