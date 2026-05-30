package com.camping.controller;

import com.camping.common.Result;
import com.camping.dto.LoginDTO;
import com.camping.entity.SysUser;
import com.camping.service.SysUserService;
import com.camping.vo.LoginVO;
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

    private final SysUserService sysUserService;

    @PostMapping("/login")
    public Result<LoginVO> login(@Valid @RequestBody LoginDTO dto) {
        LoginVO vo = sysUserService.login(dto);
        return Result.success(vo);
    }

    @PostMapping("/register")
    public Result<Void> register(@Valid @RequestBody SysUser user) {
        sysUserService.register(user);
        return Result.success();
    }
}
