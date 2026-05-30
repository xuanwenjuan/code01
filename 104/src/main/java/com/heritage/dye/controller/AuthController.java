package com.heritage.dye.controller;

import com.heritage.dye.common.Result;
import com.heritage.dye.dto.LoginDTO;
import com.heritage.dye.service.UserService;
import com.heritage.dye.vo.LoginVO;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private UserService userService;

    @PostMapping("/login")
    public Result<LoginVO> login(@RequestBody @Valid LoginDTO dto) {
        return Result.success(userService.login(dto));
    }
}
