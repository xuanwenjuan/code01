package com.cosmetics.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.cosmetics.annotation.RequireRole;
import com.cosmetics.common.PageQuery;
import com.cosmetics.common.Result;
import com.cosmetics.entity.OperationLog;
import com.cosmetics.enums.UserRoleEnum;
import com.cosmetics.service.OperationLogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Tag(name = "操作日志管理")
@RestController
@RequestMapping("/operation-logs")
@RequiredArgsConstructor
public class OperationLogController {

    private final OperationLogService operationLogService;

    @Operation(summary = "分页查询操作日志")
    @GetMapping("/page")
    @RequireRole({UserRoleEnum.PRODUCTION_LEADER, UserRoleEnum.FORMULA_DEVELOPER})
    public Result<Page<OperationLog>> getPage(
            @ModelAttribute PageQuery pageQuery,
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String module,
            @RequestParam(required = false) Integer status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return Result.success(operationLogService.getPage(pageQuery, userId, module, status, startDate, endDate));
    }

    @Operation(summary = "获取操作日志详情")
    @GetMapping("/{id}")
    @RequireRole({UserRoleEnum.PRODUCTION_LEADER, UserRoleEnum.FORMULA_DEVELOPER})
    public Result<OperationLog> getById(@PathVariable Long id) {
        return Result.success(operationLogService.getById(id));
    }

    @Operation(summary = "获取操作日志统计")
    @GetMapping("/statistics")
    @RequireRole({UserRoleEnum.PRODUCTION_LEADER, UserRoleEnum.FORMULA_DEVELOPER})
    public Result<Map<String, Object>> getStatistics(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return Result.success(operationLogService.getStatistics(startDate, endDate));
    }

    @Operation(summary = "获取热门操作排行")
    @GetMapping("/top-operations")
    @RequireRole({UserRoleEnum.PRODUCTION_LEADER, UserRoleEnum.FORMULA_DEVELOPER})
    public Result<List<Map<String, Object>>> getTopOperations(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "10") Integer limit) {
        return Result.success(operationLogService.getTopOperations(startDate, endDate, limit));
    }
}
