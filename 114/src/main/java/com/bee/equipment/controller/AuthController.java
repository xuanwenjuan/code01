package com.bee.equipment.controller;

import com.bee.equipment.common.Result;
import com.bee.equipment.dto.LoginDTO;
import com.bee.equipment.dto.RegisterDTO;
import com.bee.equipment.entity.SysUser;
import com.bee.equipment.service.SysUserService;
import com.bee.equipment.util.JwtUtil;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private SysUserService sysUserService;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/login")
    public Result<Map<String, Object>> login(@Valid @RequestBody LoginDTO loginDTO) {
        SysUser user = sysUserService.login(loginDTO);
        String token = jwtUtil.generateToken(user.getId(), user.getUsername(), user.getRole());

        Map<String, Object> data = new HashMap<>();
        data.put("token", token);
        data.put("user", user);

        return Result.success("登录成功", data);
    }

    @PostMapping("/register")
    public Result<Void> register(@Valid @RequestBody RegisterDTO registerDTO) {
        sysUserService.register(registerDTO);
        return Result.success("注册成功", null);
    }
}
