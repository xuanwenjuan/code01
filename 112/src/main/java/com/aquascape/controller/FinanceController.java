package com.aquascape.controller;

import com.aquascape.annotation.OperationLog;
import com.aquascape.annotation.RequiresRole;
import com.aquascape.common.Result;
import com.aquascape.dto.FinanceRecordDTO;
import com.aquascape.service.FinanceService;
import com.aquascape.vo.FinanceReportVO;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.aquascape.entity.FinanceRecord;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/finance")
public class FinanceController {

    @Autowired
    private FinanceService financeService;

    @GetMapping("/page")
    @RequiresRole({"ADMIN"})
    public Result<Page<FinanceRecord>> page(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) Integer recordType,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate) {
        return Result.success(financeService.page(page, size, recordType, startDate, endDate));
    }

    @GetMapping
    @RequiresRole({"ADMIN"})
    public Result<List<FinanceRecord>> list() {
        return Result.success(financeService.list());
    }

    @GetMapping("/dashboard")
    @RequiresRole({"ADMIN"})
    public Result<Map<String, Object>> getDashboardData() {
        return Result.success(financeService.getDashboardData());
    }

    @GetMapping("/report")
    @RequiresRole({"ADMIN"})
    public Result<Map<String, Object>> getReport(
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate) {
        return Result.success(financeService.getReport(startDate, endDate));
    }

    @PostMapping
    @RequiresRole({"ADMIN"})
    @OperationLog(module = "财务管理", operation = "新增财务记录")
    public Result<Void> addRecord(@RequestBody FinanceRecordDTO record) {
        financeService.addRecord(record);
        return Result.success();
    }

    @PutMapping("/{id}")
    @RequiresRole({"ADMIN"})
    @OperationLog(module = "财务管理", operation = "编辑财务记录")
    public Result<Void> update(@PathVariable Long id, @RequestBody FinanceRecord record) {
        financeService.update(id, record);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    @RequiresRole({"ADMIN"})
    @OperationLog(module = "财务管理", operation = "删除财务记录")
    public Result<Void> delete(@PathVariable Long id) {
        financeService.delete(id);
        return Result.success();
    }
}
