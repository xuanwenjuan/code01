package com.watchrepair.admin.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.watchrepair.admin.common.Result;
import com.watchrepair.admin.dto.LoginDTO;
import com.watchrepair.admin.entity.User;
import com.watchrepair.admin.enums.RoleEnum;
import com.watchrepair.admin.mapper.UserMapper;
import com.watchrepair.admin.util.JwtUtil;
import com.watchrepair.admin.vo.LoginVO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @PostMapping("/login")
    public Result<LoginVO> login(@Valid @RequestBody LoginDTO loginDTO) {
        User user = userMapper.selectOne(
                new LambdaQueryWrapper<User>()
                        .eq(User::getUsername, loginDTO.getUsername())
                        .eq(User::getStatus, 1)
        );

        if (user == null || !passwordEncoder.matches(loginDTO.getPassword(), user.getPassword())) {
            return Result.error("用户名或密码错误");
        }

        String token = jwtUtil.generateToken(user.getId(), user.getUsername(), user.getRole());

        LoginVO loginVO = new LoginVO();
        loginVO.setUserId(user.getId());
        loginVO.setUsername(user.getUsername());
        loginVO.setRealName(user.getRealName());
        loginVO.setRole(user.getRole());
        loginVO.setRoleDesc(RoleEnum.getByCode(user.getRole()).getDesc());
        loginVO.setToken(token);

        return Result.success(loginVO);
    }

    @PostMapping("/register")
    public Result<Void> register(@Valid @RequestBody LoginDTO loginDTO) {
        User existUser = userMapper.selectOne(
                new LambdaQueryWrapper<User>().eq(User::getUsername, loginDTO.getUsername())
        );

        if (existUser != null) {
            return Result.error("用户名已存在");
        }

        User user = new User();
        user.setUsername(loginDTO.getUsername());
        user.setPassword(passwordEncoder.encode(loginDTO.getPassword()));
        user.setRealName(loginDTO.getUsername());
        user.setRole(RoleEnum.PARTS_SELECTOR.getCode());
        user.setStatus(1);

        userMapper.insert(user);
        return Result.success();
    }
}