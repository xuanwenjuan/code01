package com.liquor.brewing.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.liquor.brewing.common.PageQuery;
import com.liquor.brewing.common.PageResult;
import com.liquor.brewing.common.Result;
import com.liquor.brewing.entity.SysUser;
import com.liquor.brewing.service.SysUserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.annotation.Resource;
import org.springframework.web.bind.annotation.*;

@Tag(name = "用户管理", description = "系统用户管理接口")
@RestController
@RequestMapping("/system/users")
public class SysUserController {

    @Resource
    private SysUserService sysUserService;

    @Operation(summary = "分页查询用户列表")
    @GetMapping("/page")
    public Result<PageResult<SysUser>> page(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Integer roleId,
            @RequestParam(required = false) Integer status,
            PageQuery pageQuery) {
        IPage<SysUser> page = sysUserService.page(keyword, roleId, status, pageQuery);
        return Result.success(PageResult.of(page));
    }

    @Operation(summary = "获取用户详情")
    @GetMapping("/{id}")
    public Result<SysUser> getById(@PathVariable Long id) {
        return Result.success(sysUserService.getById(id));
    }

    @Operation(summary = "新增用户")
    @PostMapping
    public Result<Void> add(@RequestBody SysUser user) {
        sysUserService.add(user);
        return Result.success();
    }

    @Operation(summary = "修改用户")
    @PutMapping
    public Result<Void> update(@RequestBody SysUser user) {
        sysUserService.update(user);
        return Result.success();
    }

    @Operation(summary = "删除用户")
    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        sysUserService.delete(id);
        return Result.success();
    }

    @Operation(summary = "修改用户状态")
    @PutMapping("/{id}/status")
    public Result<Void> updateStatus(@PathVariable Long id, @RequestParam Integer status) {
        sysUserService.updateStatus(id, status);
        return Result.success();
    }

    @Operation(summary = "重置密码")
    @PutMapping("/{id}/reset-password")
    public Result<Void> resetPassword(@PathVariable Long id) {
        sysUserService.resetPassword(id);
        return Result.success();
    }
}
