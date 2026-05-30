package com.aluminum.extrusion.controller;

import com.aluminum.extrusion.common.Result;
import com.aluminum.extrusion.dto.LoginDTO;
import com.aluminum.extrusion.entity.SysUser;
import com.aluminum.extrusion.service.SysUserService;
import com.aluminum.extrusion.vo.LoginVO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final SysUserService sysUserService;

    @PostMapping("/login")
    public Result<LoginVO> login(@Valid @RequestBody LoginDTO loginDTO) {
        LoginVO loginVO = sysUserService.login(loginDTO);
        return Result.success("登录成功", loginVO);
    }

    @PostMapping("/register")
    public Result<Void> register(@Valid @RequestBody SysUser user) {
        sysUserService.register(user);
        return Result.success("注册成功");
    }
}
