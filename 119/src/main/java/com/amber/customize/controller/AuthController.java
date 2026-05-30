package com.amber.customize.controller;

import com.amber.customize.annotation.OperateLog;
import com.amber.customize.annotation.RequireRole;
import com.amber.customize.common.Result;
import com.amber.customize.dto.LoginDTO;
import com.amber.customize.entity.SysUser;
import com.amber.customize.service.SysUserService;
import com.amber.customize.util.UserContext;
import com.amber.customize.vo.LoginUserVO;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final SysUserService sysUserService;

    @PostMapping("/login")
    @OperateLog(module = "认证", operation = "用户登录")
    public Result<Map<String, Object>> login(@Valid @RequestBody LoginDTO dto) {
        return Result.success(sysUserService.login(dto));
    }

    @PostMapping("/register")
    @OperateLog(module = "认证", operation = "用户注册")
    public Result<Void> register(@Valid @RequestBody RegisterDTO dto) {
        SysUser user = new SysUser();
        user.setUsername(dto.getUsername());
        user.setPassword(dto.getPassword());
        user.setRealName(dto.getRealName());
        user.setPhone(dto.getPhone());
        user.setRole(dto.getRole());
        user.setStatus(1);
        sysUserService.register(user);
        return Result.success();
    }

    @GetMapping("/info")
    public Result<LoginUserVO> getUserInfo() {
        return Result.success(sysUserService.getCurrentUserInfo(UserContext.getUserId()));
    }

    @GetMapping("/users")
    @RequireRole({4})
    public Result<List<SysUser>> listUsers() {
        return Result.success(sysUserService.list());
    }

    @GetMapping("/users/{id}")
    @RequireRole({4})
    public Result<SysUser> getUserById(@PathVariable Long id) {
        return Result.success(sysUserService.getById(id));
    }

    @PutMapping("/users")
    @RequireRole({4})
    @OperateLog(module = "用户管理", operation = "更新用户")
    public Result<Void> updateUser(@RequestBody SysUser user) {
        sysUserService.updateById(user);
        return Result.success();
    }

    @DeleteMapping("/users/{id}")
    @RequireRole({4})
    @OperateLog(module = "用户管理", operation = "删除用户")
    public Result<Void> deleteUser(@PathVariable Long id) {
        sysUserService.removeById(id);
        return Result.success();
    }

    @Data
    public static class RegisterDTO {
        @NotBlank(message = "用户名不能为空")
        private String username;

        @NotBlank(message = "密码不能为空")
        private String password;

        @NotBlank(message = "真实姓名不能为空")
        private String realName;

        private String phone;

        private Integer role;
    }

}
