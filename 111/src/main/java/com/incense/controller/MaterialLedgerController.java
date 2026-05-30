package com.incense.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.incense.annotation.OperationLog;
import com.incense.annotation.RequiresRole;
import com.incense.common.Result;
import com.incense.dto.MaterialLedgerDTO;
import com.incense.dto.ProductionLossDTO;
import com.incense.entity.MaterialLedger;
import com.incense.entity.ProductionLoss;
import com.incense.entity.QuarterlyReport;
import com.incense.service.MaterialLedgerService;
import com.incense.service.ProductionLossService;
import com.incense.service.QuarterlyReportService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/ledger")
@RequiredArgsConstructor
public class MaterialLedgerController {

    private final MaterialLedgerService materialLedgerService;
    private final QuarterlyReportService quarterlyReportService;
    private final ProductionLossService productionLossService;

    @GetMapping("/page")
    public Result<Page<MaterialLedger>> getPage(
            @RequestParam(defaultValue = "1") int pageNum,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(required = false) String ledgerType,
            @RequestParam(required = false) Long materialId,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate) {
        return Result.success(materialLedgerService.getPage(pageNum, pageSize, ledgerType, materialId, startDate, endDate));
    }

    @GetMapping("/stats")
    public Result<Map<String, Object>> getLedgerStats(
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month) {
        return Result.success(materialLedgerService.getLedgerStats(year, month));
    }

    @GetMapping("/{id}")
    public Result<MaterialLedger> getById(@PathVariable Long id) {
        return Result.success(materialLedgerService.getById(id));
    }

    @PostMapping
    @RequiresRole({"ADMIN", "KEEPER"})
    @OperationLog(module = "台账管理", operation = "新增台账记录")
    public Result<Void> add(@Valid @RequestBody MaterialLedgerDTO dto) {
        materialLedgerService.addLedger(dto);
        return Result.success();
    }

    @PostMapping("/loss")
    @RequiresRole({"ADMIN", "KEEPER", "MASTER"})
    @OperationLog(module = "台账管理", operation = "记录生产损耗")
    public Result<Void> recordLoss(@Valid @RequestBody ProductionLossDTO dto) {
        productionLossService.recordLoss(dto);
        return Result.success();
    }

    @GetMapping("/order/{orderId}/loss")
    public Result<List<ProductionLoss>> getOrderLossList(@PathVariable Long orderId) {
        return Result.success(productionLossService.getLossByOrderId(orderId));
    }

    @GetMapping("/report/page")
    public Result<Page<QuarterlyReport>> getReportPage(
            @RequestParam(defaultValue = "1") int pageNum,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer quarter) {
        return Result.success(quarterlyReportService.getPage(pageNum, pageSize, year, quarter));
    }

    @GetMapping("/report/all")
    public Result<List<QuarterlyReport>> getAllReports() {
        return Result.success(quarterlyReportService.getAll());
    }

    @PostMapping("/report/generate")
    @RequiresRole({"ADMIN"})
    public Result<Void> generateReport(@RequestParam Integer year, @RequestParam Integer quarter) {
        quarterlyReportService.generateQuarterlyReport(year, quarter);
        return Result.success();
    }
}
