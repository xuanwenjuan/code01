package com.bearing.production.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.bearing.production.annotation.OperationLog;
import com.bearing.production.annotation.RequiresRole;
import com.bearing.production.common.Result;
import com.bearing.production.entity.ProductionWaste;
import com.bearing.production.enums.RoleEnum;
import com.bearing.production.service.ProductionWasteService;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/production-waste")
@RequiredArgsConstructor
public class ProductionWasteController {

    private final ProductionWasteService productionWasteService;

    @GetMapping("/{id}")
    @RequiresRole({RoleEnum.ADMIN_CODE, RoleEnum.PROCESS_ENGINEER_CODE, RoleEnum.QUALITY_INSPECTOR_CODE})
    public Result<ProductionWaste> getById(@PathVariable @NotNull Long id) {
        ProductionWaste waste = productionWasteService.getById(id);
        return Result.success("查询成功", waste);
    }

    @GetMapping("/work-order/{workOrderId}")
    @RequiresRole({RoleEnum.ADMIN_CODE, RoleEnum.PROCESS_ENGINEER_CODE, RoleEnum.QUALITY_INSPECTOR_CODE})
    public Result<List<ProductionWaste>> getByWorkOrderId(@PathVariable @NotNull Long workOrderId) {
        List<ProductionWaste> list = productionWasteService.getByWorkOrderId(workOrderId);
        return Result.success("查询成功", list);
    }

    @GetMapping("/category/{categoryId}")
    @RequiresRole({RoleEnum.ADMIN_CODE, RoleEnum.PROCESS_ENGINEER_CODE})
    public Result<List<ProductionWaste>> getByCategoryId(
            @PathVariable @NotNull Long categoryId,
            @RequestParam(required = false) LocalDateTime startDate,
            @RequestParam(required = false) LocalDateTime endDate) {
        List<ProductionWaste> list = productionWasteService.getByCategoryId(categoryId, startDate, endDate);
        return Result.success("查询成功", list);
    }

    @GetMapping("/page")
    @RequiresRole({RoleEnum.ADMIN_CODE, RoleEnum.PROCESS_ENGINEER_CODE})
    public Result<IPage<ProductionWaste>> getByPage(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        IPage<ProductionWaste> pageResult = productionWasteService.getByPage(page, size, categoryId);
        return Result.success("查询成功", pageResult);
    }

    @GetMapping("/total-cost/{categoryId}")
    @RequiresRole({RoleEnum.ADMIN_CODE, RoleEnum.PROCESS_ENGINEER_CODE})
    public Result<BigDecimal> calculateTotalCostByCategory(
            @PathVariable @NotNull Long categoryId,
            @RequestParam(required = false) LocalDateTime startDate,
            @RequestParam(required = false) LocalDateTime endDate) {
        BigDecimal totalCost = productionWasteService.calculateTotalCostByCategory(categoryId, startDate, endDate);
        return Result.success("查询成功", totalCost);
    }
}
