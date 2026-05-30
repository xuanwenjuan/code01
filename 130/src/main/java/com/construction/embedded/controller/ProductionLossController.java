package com.construction.embedded.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.construction.embedded.annotation.RequiresRole;
import com.construction.embedded.common.Result;
import com.construction.embedded.constant.RoleConstants;
import com.construction.embedded.dto.DefectHandleDTO;
import com.construction.embedded.entity.ProductionLossRecord;
import com.construction.embedded.service.ProductionLossService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/production-loss")
public class ProductionLossController {

    @Autowired
    private ProductionLossService productionLossService;

    @PostMapping("/defect")
    @RequiresRole({RoleConstants.INSPECTOR, RoleConstants.TEAM_LEADER, RoleConstants.ADMIN})
    public Result<Void> handleDefect(@Valid @RequestBody DefectHandleDTO dto) {
        productionLossService.handleDefect(dto);
        return Result.success("次品处理完成", null);
    }

    @PostMapping("/collect/{orderId}")
    @RequiresRole({RoleConstants.TEAM_LEADER, RoleConstants.TECHNICIAN, RoleConstants.ADMIN})
    public Result<Void> collectLossOnCompletion(@PathVariable Long orderId) {
        productionLossService.collectLossOnCompletion(orderId);
        return Result.success("生产损耗归集完成", null);
    }

    @GetMapping("/total-cost/{orderId}")
    public Result<BigDecimal> getOrderTotalLossCost(@PathVariable Long orderId) {
        BigDecimal totalLossCost = productionLossService.getOrderTotalLossCost(orderId);
        return Result.success(totalLossCost);
    }

    @GetMapping
    public Result<IPage<ProductionLossRecord>> list(
            @RequestParam(required = false) Long orderId,
            @RequestParam(required = false) String lossType,
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize) {
        IPage<ProductionLossRecord> page = productionLossService.queryPage(orderId, lossType, pageNum, pageSize);
        return Result.success(page);
    }

    @GetMapping("/{id}")
    public Result<ProductionLossRecord> getById(@PathVariable Long id) {
        ProductionLossRecord record = productionLossService.getById(id);
        return Result.success(record);
    }
}
