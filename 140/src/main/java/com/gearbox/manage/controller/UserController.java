package com.gearbox.manage.controller;

import com.gearbox.manage.common.Result;
import com.gearbox.manage.service.SysUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
public class UserController {

    private final SysUserService sysUserService;

    @GetMapping("/list-by-role/{role}")
    public Result<?> listByRole(@PathVariable String role) {
        return Result.success(sysUserService.listByRole(role));
    }
}
