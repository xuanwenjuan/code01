package com.bearing.production.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.bearing.production.annotation.OperationLog;
import com.bearing.production.annotation.RequiresRole;
import com.bearing.production.common.Result;
import com.bearing.production.entity.CostSummary;
import com.bearing.production.entity.WorkOrder;
import com.bearing.production.enums.RoleEnum;
import com.bearing.production.service.CostSummaryService;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cost-summary")
@RequiredArgsConstructor
public class CostSummaryController {

    private final CostSummaryService costSummaryService;

    @PostMapping("/generate")
    @RequiresRole({RoleEnum.ADMIN_CODE, RoleEnum.PROCESS_ENGINEER_CODE})
    @OperationLog(module = "生产制造成本汇总", description = "生成季度报表")
    public Result<Void> generateQuarterlyReport(
            @RequestParam @NotNull Integer year,
            @RequestParam @NotNull Integer quarter) {
        costSummaryService.generateQuarterlyReport(year, quarter);
        return Result.success("报表生成成功", null);
    }

    @GetMapping("/{id}")
    @RequiresRole({RoleEnum.ADMIN_CODE, RoleEnum.PROCESS_ENGINEER_CODE})
    public Result<CostSummary> getById(@PathVariable @NotNull Long id) {
        CostSummary summary = costSummaryService.getById(id);
        return Result.success("查询成功", summary);
    }

    @GetMapping("/report")
    @RequiresRole({RoleEnum.ADMIN_CODE, RoleEnum.PROCESS_ENGINEER_CODE})
    public Result<List<CostSummary>> getQuarterlyReport(
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer quarter,
            @RequestParam(required = false) Long categoryId) {
        List<CostSummary> list = costSummaryService.getQuarterlyReport(year, quarter, categoryId);
        return Result.success("查询成功", list);
    }

    @GetMapping("/report/page")
    @RequiresRole({RoleEnum.ADMIN_CODE, RoleEnum.PROCESS_ENGINEER_CODE})
    public Result<IPage<CostSummary>> getQuarterlyReportPage(
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer quarter,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        IPage<CostSummary> pageResult = costSummaryService.getQuarterlyReportPage(year, quarter, categoryId, page, size);
        return Result.success("查询成功", pageResult);
    }

    @GetMapping("/work-order-details")
    @RequiresRole({RoleEnum.ADMIN_CODE, RoleEnum.PROCESS_ENGINEER_CODE})
    public Result<List<WorkOrder>> getWorkOrderDetails(
            @RequestParam(required = false) Long categoryId,
            @RequestParam @NotNull Integer year,
            @RequestParam @NotNull Integer quarter) {
        List<WorkOrder> list = costSummaryService.getWorkOrderDetails(categoryId, year, quarter);
        return Result.success("查询成功", list);
    }
}
