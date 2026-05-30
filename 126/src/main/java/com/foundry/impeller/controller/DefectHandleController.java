package com.foundry.impeller.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.foundry.impeller.annotation.OperationLog;
import com.foundry.impeller.annotation.RequiresRole;
import com.foundry.impeller.common.Result;
import com.foundry.impeller.entity.DefectHandle;
import com.foundry.impeller.service.DefectHandleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/defects")
@RequiredArgsConstructor
public class DefectHandleController {

    private final DefectHandleService defectHandleService;

    @GetMapping
    public Result<Page<DefectHandle>> list(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String handleType,
            @RequestParam(required = false) String status) {
        return Result.success(defectHandleService.list(page, size, handleType, status));
    }

    @GetMapping("/{id}")
    public Result<DefectHandle> getById(@PathVariable Long id) {
        return Result.success(defectHandleService.getById(id));
    }

    @PostMapping("/handle")
    @RequiresRole({"INSPECTOR", "ADMIN"})
    @OperationLog(value = "残次品处理", module = "品质管理")
    public Result<Void> handleDefect(@Valid @RequestBody DefectHandle defectHandle) {
        defectHandleService.handleDefect(defectHandle);
        return Result.success();
    }

    @PutMapping
    @RequiresRole({"INSPECTOR", "ADMIN"})
    public Result<Void> update(@RequestBody DefectHandle defectHandle) {
        defectHandleService.update(defectHandle);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    @RequiresRole({"ADMIN"})
    public Result<Void> delete(@PathVariable Long id) {
        defectHandleService.delete(id);
        return Result.success();
    }
}
