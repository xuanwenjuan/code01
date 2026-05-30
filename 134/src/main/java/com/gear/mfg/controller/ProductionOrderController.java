package com.gear.mfg.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.gear.mfg.annotation.OperationLog;
import com.gear.mfg.annotation.RequireRole;
import com.gear.mfg.common.PageResult;
import com.gear.mfg.common.Result;
import com.gear.mfg.dto.ProductionOrderCreateDTO;
import com.gear.mfg.dto.ProductionReportSubmitDTO;
import com.gear.mfg.entity.*;
import com.gear.mfg.mapper.ProductionCostMapper;
import com.gear.mfg.mapper.ProductionOrderMapper;
import com.gear.mfg.mapper.ProductionReportMapper;
import com.gear.mfg.mapper.QualityCheckMapper;
import com.gear.mfg.service.ProductionCostService;
import com.gear.mfg.service.ProductionFlowService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/order")
@RequiredArgsConstructor
public class ProductionOrderController {

    private final ProductionFlowService productionFlowService;
    private final ProductionOrderMapper productionOrderMapper;
    private final ProductionReportMapper productionReportMapper;
    private final QualityCheckMapper qualityCheckMapper;
    private final ProductionCostMapper productionCostMapper;
    private final ProductionCostService productionCostService;

    @GetMapping("/list")
    @RequireRole({"ADMIN", "PROCESS_ENGINEER", "PRODUCTION_LEADER"})
    public Result<PageResult<ProductionOrder>> getOrderList(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) Integer status,
            @RequestParam(required = false) String gearModel,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime endDate) {

        Page<ProductionOrder> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<ProductionOrder> wrapper = new LambdaQueryWrapper<>();

        if (status != null) {
            wrapper.eq(ProductionOrder::getStatus, status);
        }
        if (gearModel != null) {
            wrapper.like(ProductionOrder::getGearModel, gearModel);
        }
        if (startDate != null) {
            wrapper.ge(ProductionOrder::getCreateTime, startDate);
        }
        if (endDate != null) {
            wrapper.le(ProductionOrder::getCreateTime, endDate);
        }
        wrapper.orderByDesc(ProductionOrder::getCreateTime);

        Page<ProductionOrder> result = productionOrderMapper.selectPage(page, wrapper);
        PageResult<ProductionOrder> pageResult = new PageResult<>(
                result.getRecords(), result.getTotal(), pageNum, pageSize
        );
        return Result.success(pageResult);
    }

    @PostMapping
    @RequireRole({"ADMIN", "PROCESS_ENGINEER"})
    public Result<ProductionOrder> createOrder(@Valid @RequestBody ProductionOrderCreateDTO dto) {
        ProductionOrder order = productionFlowService.createProductionOrder(dto);
        return Result.success(order);
    }

    @GetMapping("/{orderId}")
    @RequireRole({"ADMIN", "PROCESS_ENGINEER", "PRODUCTION_LEADER"})
    @Cacheable(value = "order", key = "#orderId", unless = "#result == null")
    public Result<ProductionOrder> getOrderById(@PathVariable Long orderId) {
        ProductionOrder order = productionFlowService.getOrderById(orderId);
        return Result.success(order);
    }

    @GetMapping("/{orderId}/processes")
    @RequireRole({"ADMIN", "PROCESS_ENGINEER", "PRODUCTION_LEADER"})
    @Cacheable(value = "process", key = "#orderId")
    public Result<List<OrderProcess>> getOrderProcesses(@PathVariable Long orderId) {
        List<OrderProcess> processes = productionFlowService.getOrderProcesses(orderId);
        return Result.success(processes);
    }

    @PutMapping("/{orderId}/process/{processNo}/start")
    @RequireRole({"ADMIN", "PRODUCTION_LEADER"})
    public Result<OrderProcess> startProcess(@PathVariable Long orderId, @PathVariable Integer processNo) {
        OrderProcess process = productionFlowService.startProcess(orderId, processNo);
        return Result.success(process);
    }

    @PutMapping("/{orderId}/process/{processNo}/complete")
    @RequireRole({"ADMIN", "PRODUCTION_LEADER"})
    public Result<Void> completeProcess(@PathVariable Long orderId, @PathVariable Integer processNo) {
        productionFlowService.completeProcess(orderId, processNo);
        return Result.success();
    }

    @PostMapping("/report")
    @RequireRole({"ADMIN", "PRODUCTION_LEADER"})
    public Result<ProductionReport> submitReport(@Valid @RequestBody ProductionReportSubmitDTO dto) {
        ProductionReport report = productionFlowService.submitProductionReport(dto);
        return Result.success(report);
    }

    @GetMapping("/{orderId}/reports")
    @RequireRole({"ADMIN", "PROCESS_ENGINEER", "PRODUCTION_LEADER"})
    public Result<List<ProductionReport>> getOrderReports(@PathVariable Long orderId) {
        LambdaQueryWrapper<ProductionReport> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ProductionReport::getOrderId, orderId)
                .orderByDesc(ProductionReport::getReportTime);
        List<ProductionReport> reports = productionReportMapper.selectList(wrapper);
        return Result.success(reports);
    }

    @PostMapping("/quality-check")
    @RequireRole({"ADMIN", "QUALITY_INSPECTOR"})
    public Result<QualityCheck> submitQualityCheck(
            @RequestParam Long orderId,
            @RequestParam Integer processNo,
            @RequestParam String checkResult,
            @RequestParam BigDecimal checkQuantity,
            @RequestParam(required = false) BigDecimal badQuantity,
            @RequestParam(required = false) String badReason,
            @RequestParam(required = false) String inspector) {

        QualityCheck check = productionFlowService.submitQualityCheck(
                orderId, processNo, checkResult, checkQuantity, badQuantity, badReason, inspector
        );
        return Result.success(check);
    }

    @GetMapping("/{orderId}/quality-checks")
    @RequireRole({"ADMIN", "PROCESS_ENGINEER", "QUALITY_INSPECTOR"})
    public Result<List<QualityCheck>> getOrderQualityChecks(@PathVariable Long orderId) {
        LambdaQueryWrapper<QualityCheck> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(QualityCheck::getOrderId, orderId)
                .orderByDesc(QualityCheck::getCheckTime);
        List<QualityCheck> checks = qualityCheckMapper.selectList(wrapper);
        return Result.success(checks);
    }

    @PostMapping("/cost/calculate/{orderId}")
    @RequireRole({"ADMIN", "PROCESS_ENGINEER", "FINANCE"})
    @OperationLog(module = "生产成本", operation = "核算成本", description = "自动核算工单生产成本")
    public Result<ProductionCost> calculateCost(@PathVariable Long orderId) {
        ProductionOrder order = productionFlowService.getOrderById(orderId);
        ProductionCost cost = productionCostService.calculateProductionCost(
                orderId, order.getGearModel(), order.getQuantity()
        );
        return Result.success(cost);
    }

    @GetMapping("/{orderId}/cost")
    @RequireRole({"ADMIN", "PROCESS_ENGINEER", "FINANCE"})
    @Cacheable(value = "cost", key = "#orderId")
    public Result<ProductionCost> getOrderCost(@PathVariable Long orderId) {
        LambdaQueryWrapper<ProductionCost> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ProductionCost::getOrderId, orderId)
                .orderByDesc(ProductionCost::getCostDate)
                .last("LIMIT 1");
        ProductionCost cost = productionCostMapper.selectOne(wrapper);
        return Result.success(cost);
    }

    @GetMapping("/cost/list")
    @RequireRole({"ADMIN", "PROCESS_ENGINEER", "FINANCE"})
    public Result<PageResult<ProductionCost>> getCostList(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String gearModel,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime endDate) {

        Page<ProductionCost> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<ProductionCost> wrapper = new LambdaQueryWrapper<>();

        if (gearModel != null) {
            wrapper.like(ProductionCost::getGearModel, gearModel);
        }
        if (startDate != null) {
            wrapper.ge(ProductionCost::getCostDate, startDate);
        }
        if (endDate != null) {
            wrapper.le(ProductionCost::getCostDate, endDate);
        }
        wrapper.orderByDesc(ProductionCost::getCostDate);

        Page<ProductionCost> result = productionCostMapper.selectPage(page, wrapper);
        PageResult<ProductionCost> pageResult = new PageResult<>(
                result.getRecords(), result.getTotal(), pageNum, pageSize
        );
        return Result.success(pageResult);
    }
}
