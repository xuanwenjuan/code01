package com.stationery.manufacture.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.stationery.manufacture.common.RequireRole;
import com.stationery.manufacture.common.Result;
import com.stationery.manufacture.entity.StockFlow;
import com.stationery.manufacture.entity.StockInbound;
import com.stationery.manufacture.entity.StockOutbound;
import com.stationery.manufacture.service.StockBusinessService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/stock/business")
@Tag(name = "库存业务管理")
@RequireRole({"PURCHASER", "ADMIN", "PRODUCTION_LEADER"})
public class StockBusinessController {

    private final StockBusinessService stockBusinessService;

    public StockBusinessController(StockBusinessService stockBusinessService) {
        this.stockBusinessService = stockBusinessService;
    }

    @PostMapping("/inbound")
    @Operation(summary = "创建入库单")
    @RequireRole({"PURCHASER", "ADMIN"})
    public Result<Void> createInbound(@Valid @RequestBody StockInbound inbound) {
        stockBusinessService.createInbound(inbound);
        return Result.success();
    }

    @PutMapping("/inbound/{id}/confirm")
    @Operation(summary = "确认入库")
    @RequireRole({"PURCHASER", "ADMIN"})
    public Result<Void> confirmInbound(@PathVariable Long id) {
        stockBusinessService.confirmInbound(id);
        return Result.success();
    }

    @GetMapping("/inbound/page")
    @Operation(summary = "入库单列表")
    public Result<Page<StockInbound>> getInboundPage(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String inboundNo,
            @RequestParam(required = false) Long materialId,
            @RequestParam(required = false) Integer status) {
        return Result.success(stockBusinessService.getInboundPage(pageNum, pageSize, inboundNo, materialId, status));
    }

    @PostMapping("/outbound")
    @Operation(summary = "创建出库单")
    @RequireRole({"PRODUCTION_LEADER", "ADMIN"})
    public Result<Void> createOutbound(@Valid @RequestBody StockOutbound outbound) {
        stockBusinessService.createOutbound(outbound);
        return Result.success();
    }

    @PutMapping("/outbound/{id}/confirm")
    @Operation(summary = "确认出库")
    @RequireRole({"PRODUCTION_LEADER", "ADMIN"})
    public Result<Void> confirmOutbound(@PathVariable Long id) {
        stockBusinessService.confirmOutbound(id);
        return Result.success();
    }

    @GetMapping("/outbound/page")
    @Operation(summary = "出库单列表")
    public Result<Page<StockOutbound>> getOutboundPage(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String outboundNo,
            @RequestParam(required = false) Long materialId,
            @RequestParam(required = false) Integer status) {
        return Result.success(stockBusinessService.getOutboundPage(pageNum, pageSize, outboundNo, materialId, status));
    }

    @GetMapping("/flow/page")
    @Operation(summary = "库存流水列表")
    public Result<Page<StockFlow>> getFlowPage(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) Long materialId,
            @RequestParam(required = false) String flowType,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime startTime,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime endTime) {
        return Result.success(stockBusinessService.getFlowPage(pageNum, pageSize, materialId, flowType, startTime, endTime));
    }

    @GetMapping("/flow/material/{materialId}")
    @Operation(summary = "物料流水记录")
    public Result<List<StockFlow>> getMaterialFlow(@PathVariable Long materialId) {
        return Result.success(stockBusinessService.getMaterialFlow(materialId));
    }
}
