package com.aluminum.extrusion.controller;

import com.aluminum.extrusion.annotation.RequireRole;
import com.aluminum.extrusion.common.Result;
import com.aluminum.extrusion.dto.CostReportQueryDTO;
import com.aluminum.extrusion.entity.ProductionCost;
import com.aluminum.extrusion.enums.RoleEnum;
import com.aluminum.extrusion.service.ProductionCostService;
import com.aluminum.extrusion.vo.MonthlyReportVO;
import com.baomidou.mybatisplus.core.metadata.IPage;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cost")
@RequiredArgsConstructor
public class ProductionCostController {

    private final ProductionCostService productionCostService;

    @PostMapping("/calculate/{workOrderId}")
    @RequireRole({RoleEnum.ADMIN, RoleEnum.QUALITY_INSPECTOR})
    public Result<Void> calculateCost(
            @PathVariable Long workOrderId,
            @Valid @RequestBody ProductionCost cost) {
        productionCostService.calculateCost(workOrderId, cost);
        return Result.success("成本核算完成");
    }

    @PostMapping("/report")
    @RequireRole({RoleEnum.ADMIN, RoleEnum.QUALITY_INSPECTOR})
    public Result<List<MonthlyReportVO>> getMonthlyReport(@Valid @RequestBody CostReportQueryDTO queryDTO) {
        List<MonthlyReportVO> report = productionCostService.getMonthlyReport(queryDTO);
        return Result.success(report);
    }

    @PostMapping("/page")
    @RequireRole({RoleEnum.ADMIN, RoleEnum.QUALITY_INSPECTOR})
    public Result<IPage<ProductionCost>> getCostPage(@Valid @RequestBody CostReportQueryDTO queryDTO) {
        IPage<ProductionCost> page = productionCostService.getCostPage(queryDTO);
        return Result.success(page);
    }

    @GetMapping("/list")
    public Result<List<ProductionCost>> list() {
        return Result.success(productionCostService.list());
    }

    @GetMapping("/{id}")
    public Result<ProductionCost> getById(@PathVariable Long id) {
        return Result.success(productionCostService.getById(id));
    }
}
