package com.stationery.manufacture.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.stationery.manufacture.common.RequireRole;
import com.stationery.manufacture.common.Result;
import com.stationery.manufacture.entity.SysUser;
import com.stationery.manufacture.service.SysUserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user")
@Tag(name = "用户管理")
@RequireRole({"ADMIN"})
public class SysUserController {

    private final SysUserService userService;

    public SysUserController(SysUserService userService) {
        this.userService = userService;
    }

    @PostMapping
    @Operation(summary = "新增用户")
    public Result<Void> add(@Valid @RequestBody SysUser user) {
        userService.addUser(user);
        return Result.success();
    }

    @PutMapping
    @Operation(summary = "修改用户")
    public Result<Void> update(@Valid @RequestBody SysUser user) {
        userService.updateUser(user);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "删除用户")
    public Result<Void> delete(@PathVariable Long id) {
        userService.deleteUser(id);
        return Result.success();
    }

    @GetMapping("/{id}")
    @Operation(summary = "获取用户详情")
    public Result<SysUser> getById(@PathVariable Long id) {
        return Result.success(userService.getUserById(id));
    }

    @GetMapping("/page")
    @Operation(summary = "分页查询用户列表")
    public Result<Page<SysUser>> getPage(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String realName,
            @RequestParam(required = false) String roleCode,
            @RequestParam(required = false) Integer status) {
        return Result.success(userService.getUserPage(pageNum, pageSize, username, realName, roleCode, status));
    }

    @GetMapping("/list/role/{roleCode}")
    @Operation(summary = "按角色获取用户列表")
    public Result<List<SysUser>> getByRole(@PathVariable String roleCode) {
        return Result.success(userService.getUserByRole(roleCode));
    }

    @GetMapping("/list/all")
    @Operation(summary = "获取所有启用用户")
    public Result<List<SysUser>> getAllActive() {
        return Result.success(userService.getAllActiveUsers());
    }

    @PutMapping("/{id}/status")
    @Operation(summary = "更新用户状态")
    public Result<Void> updateStatus(@PathVariable Long id, @RequestParam Integer status) {
        userService.updateStatus(id, status);
        return Result.success();
    }
}
