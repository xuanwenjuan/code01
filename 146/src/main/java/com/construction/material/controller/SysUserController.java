package com.construction.material.controller;

import com.construction.material.annotation.OperationLog;
import com.construction.material.annotation.RequiresRole;
import com.construction.material.common.PageQuery;
import com.construction.material.common.PageResult;
import com.construction.material.common.Result;
import com.construction.material.dto.SysUserDTO;
import com.construction.material.entity.SysUser;
import com.construction.material.service.SysUserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
public class SysUserController {

    private final SysUserService userService;

    @PostMapping
    @RequiresRole({"ADMIN"})
    @OperationLog(module = "用户管理模块", operation = "新增用户", description = "新增系统用户")
    public Result<Void> addUser(@Valid @RequestBody SysUserDTO dto) {
        userService.addUser(dto);
        return Result.success();
    }

    @PutMapping
    @RequiresRole({"ADMIN"})
    @OperationLog(module = "用户管理模块", operation = "更新用户", description = "更新用户信息")
    public Result<Void> updateUser(@Valid @RequestBody SysUserDTO dto) {
        userService.updateUser(dto);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    @RequiresRole({"ADMIN"})
    @OperationLog(module = "用户管理模块", operation = "删除用户", description = "删除系统用户")
    public Result<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return Result.success();
    }

    @GetMapping("/{id}")
    @RequiresRole({"ADMIN"})
    public Result<SysUser> getUser(@PathVariable Long id) {
        return Result.success(userService.getUser(id));
    }

    @GetMapping("/page")
    @RequiresRole({"ADMIN"})
    public Result<PageResult<SysUser>> getUserPage(
            PageQuery pageQuery,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) Integer status) {
        return Result.success(userService.getUserPage(pageQuery, role, status));
    }

    @PutMapping("/status/{id}")
    @RequiresRole({"ADMIN"})
    @OperationLog(module = "用户管理模块", operation = "更新用户状态", description = "启用/禁用用户")
    public Result<Void> updateStatus(@PathVariable Long id, @RequestParam Integer status) {
        userService.updateStatus(id, status);
        return Result.success();
    }

    @PutMapping("/password/{id}")
    @OperationLog(module = "用户管理模块", operation = "修改密码", description = "修改用户密码")
    public Result<Void> updatePassword(
            @PathVariable Long id,
            @RequestParam String oldPassword,
            @RequestParam String newPassword) {
        userService.updatePassword(id, oldPassword, newPassword);
        return Result.success();
    }

    @GetMapping("/roles")
    public Result<List<Map<String, Object>>> getRoleList() {
        return Result.success(userService.getRoleList());
    }
}
