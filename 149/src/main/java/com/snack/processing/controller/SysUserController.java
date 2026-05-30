package com.snack.processing.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.snack.processing.common.Result;
import com.snack.processing.dto.user.UserAddDTO;
import com.snack.processing.dto.user.UserQueryDTO;
import com.snack.processing.entity.SysUser;
import com.snack.processing.service.SysUserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
@Tag(name = "用户管理", description = "系统用户管理")
public class SysUserController {

    private final SysUserService sysUserService;

    @PostMapping
    @Operation(summary = "新增用户")
    public Result<Void> addUser(@Valid @RequestBody UserAddDTO dto) {
        return sysUserService.addUser(dto);
    }

    @PutMapping("/{id}")
    @Operation(summary = "更新用户")
    public Result<Void> updateUser(@PathVariable Long id, @Valid @RequestBody UserAddDTO dto) {
        return sysUserService.updateUser(id, dto);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "删除用户")
    public Result<Void> deleteUser(@PathVariable Long id) {
        return sysUserService.deleteUser(id);
    }

    @PutMapping("/{id}/disable")
    @Operation(summary = "禁用用户")
    public Result<Void> disableUser(@PathVariable Long id) {
        return sysUserService.disableUser(id);
    }

    @PutMapping("/{id}/enable")
    @Operation(summary = "启用用户")
    public Result<Void> enableUser(@PathVariable Long id) {
        return sysUserService.enableUser(id);
    }

    @GetMapping("/{id}")
    @Operation(summary = "获取用户详情")
    public Result<SysUser> getUserById(@PathVariable Long id) {
        return sysUserService.getUserById(id);
    }

    @GetMapping("/page")
    @Operation(summary = "分页查询用户列表")
    public Result<IPage<SysUser>> getUserPage(UserQueryDTO dto) {
        return sysUserService.getUserPage(dto);
    }

    @GetMapping("/list/role")
    @Operation(summary = "根据角色获取用户列表")
    public Result<List<SysUser>> getUsersByRole(@RequestParam Integer role) {
        return sysUserService.getUsersByRole(role);
    }
}
