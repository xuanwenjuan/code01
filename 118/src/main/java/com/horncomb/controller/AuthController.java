package com.horncomb.controller;

import com.horncomb.annotation.RequireRole;
import com.horncomb.common.Constants;
import com.horncomb.common.Result;
import com.horncomb.common.UserContext;
import com.horncomb.dto.LoginDTO;
import com.horncomb.service.AuthService;
import com.horncomb.vo.LoginVO;
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
        return Result.success("登录成功", loginVO);
    }

    @GetMapping("/info")
    @RequireRole({Constants.ROLE_ADMIN, Constants.ROLE_MATERIAL_SELECTOR, Constants.ROLE_CRAFTSMAN, Constants.ROLE_WAREHOUSE_MANAGER})
    public Result<LoginVO> getCurrentUserInfo() {
        Long userId = UserContext.getUserId();
        LoginVO loginVO = authService.getUserInfo(userId);
        return Result.success(loginVO);
    }
}
