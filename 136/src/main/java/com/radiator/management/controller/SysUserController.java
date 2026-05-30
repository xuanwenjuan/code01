package com.radiator.management.controller;

import com.radiator.management.annotation.OpLog;
import com.radiator.management.common.Result;
import com.radiator.management.entity.SysUser;
import com.radiator.management.service.SysUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class SysUserController {

    private final SysUserService userService;

    @GetMapping
    public Result<List<SysUser>> list(@RequestParam(required = false) String role) {
        return Result.success(userService.list(role));
    }

    @GetMapping("/{id}")
    public Result<SysUser> getById(@PathVariable Long id) {
        return Result.success(userService.getById(id));
    }

    @PostMapping
    @OpLog(module = "用户管理", operation = "新增用户")
    public Result<Void> addUser(@RequestBody SysUser user) {
        userService.addUser(user);
        return Result.success();
    }

    @PutMapping
    @OpLog(module = "用户管理", operation = "更新用户")
    public Result<Void> updateUser(@RequestBody SysUser user) {
        userService.updateUser(user);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    @OpLog(module = "用户管理", operation = "删除用户")
    public Result<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return Result.success();
    }
}