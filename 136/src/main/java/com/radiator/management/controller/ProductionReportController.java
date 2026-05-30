package com.radiator.management.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.radiator.management.annotation.OpLog;
import com.radiator.management.annotation.RequiresRole;
import com.radiator.management.common.Result;
import com.radiator.management.entity.ProductionReport;
import com.radiator.management.service.ProductionReportService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/production-report")
@RequiredArgsConstructor
@RequiresRole({"production_leader", "assembly_technician"})
public class ProductionReportController {

    private final ProductionReportService reportService;

    @PostMapping
    @OpLog(module = "生产报工", operation = "创建报工")
    public Result<Void> createReport(@RequestBody ProductionReport report, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        reportService.createReport(report, userId);
        return Result.success();
    }

    @GetMapping("/page")
    public Result<Page<ProductionReport>> listReports(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) Long workOrderId,
            @RequestParam(required = false) String processCode) {
        return Result.success(reportService.listReports(page, size, workOrderId, processCode));
    }

    @GetMapping("/{id}")
    public Result<ProductionReport> getReportById(@PathVariable Long id) {
        return Result.success(reportService.getReportById(id));
    }

    @GetMapping("/work-order/{workOrderId}")
    public Result<List<ProductionReport>> getReportsByWorkOrder(@PathVariable Long workOrderId) {
        return Result.success(reportService.getReportsByWorkOrder(workOrderId));
    }
}
