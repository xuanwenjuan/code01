package com.foundry.impeller.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.foundry.impeller.common.Result;
import com.foundry.impeller.entity.User;
import com.foundry.impeller.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping
    public Result<Page<User>> list(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String role) {
        return Result.success(userService.list(page, size, role));
    }

    @GetMapping("/{id}")
    public Result<User> getById(@PathVariable Long id) {
        return Result.success(userService.getById(id));
    }

    @GetMapping("/role/{role}")
    public Result<List<User>> listByRole(@PathVariable String role) {
        return Result.success(userService.listByRole(role));
    }

    @GetMapping("/process")
    public Result<List<User>> getProcessUsers() {
        return Result.success(userService.getProcessUsers());
    }

    @GetMapping("/team-leaders")
    public Result<List<User>> getTeamLeaders() {
        return Result.success(userService.getTeamLeaders());
    }

    @GetMapping("/inspectors")
    public Result<List<User>> getInspectors() {
        return Result.success(userService.getInspectors());
    }

    @PutMapping
    public Result<Void> update(@RequestBody User user) {
        userService.update(user);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        userService.delete(id);
        return Result.success();
    }
}
