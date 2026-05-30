package com.paper.production.controller.system;

import com.paper.production.common.Result;
import com.paper.production.dto.system.LoginDTO;
import com.paper.production.dto.system.UserRegisterDTO;
import com.paper.production.entity.system.User;
import com.paper.production.service.system.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.annotation.Resource;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Tag(name = "认证管理")
@RestController
@RequestMapping("/auth")
public class AuthController {

    @Resource
    private UserService userService;

    @Operation(summary = "登录")
    @PostMapping("/login")
    public Result<Map<String, Object>> login(@Valid @RequestBody LoginDTO loginDTO) {
        return Result.success(userService.login(loginDTO));
    }

    @Operation(summary = "注册")
    @PostMapping("/register")
    public Result<Void> register(@Valid @RequestBody UserRegisterDTO registerDTO) {
        userService.register(registerDTO);
        return Result.success();
    }

    @Operation(summary = "获取当前用户信息")
    @GetMapping("/user-info")
    public Result<User> getUserInfo() {
        return Result.success(userService.getUserInfo());
    }
}
