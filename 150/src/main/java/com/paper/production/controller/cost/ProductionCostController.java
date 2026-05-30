package com.paper.production.controller.cost;

import com.paper.production.annotation.OperateLog;
import com.paper.production.annotation.RequiresRoles;
import com.paper.production.common.PageQuery;
import com.paper.production.common.PageResult;
import com.paper.production.common.Result;
import com.paper.production.dto.cost.ProductionCostDTO;
import com.paper.production.entity.cost.CostDetail;
import com.paper.production.entity.cost.MonthlyReport;
import com.paper.production.entity.cost.ProductionCost;
import com.paper.production.enums.RoleEnum;
import com.paper.production.service.cost.ProductionCostService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.annotation.Resource;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Tag(name = "生产费用核算")
@RestController
@RequestMapping("/cost")
public class ProductionCostController {

    @Resource
    private ProductionCostService productionCostService;

    @Operation(summary = "核算工单成本")
    @PostMapping("/calculate/{workOrderId}")
    @RequiresRoles({RoleEnum.ADMIN})
    @OperateLog(module = "费用核算", operation = "核算工单成本", description = "自动核算工单生产成本")
    public Result<Void> calculateCost(@PathVariable Long workOrderId) {
        productionCostService.calculateCost(workOrderId);
        return Result.success();
    }

    @Operation(summary = "新增成本记录")
    @PostMapping
    @RequiresRoles({RoleEnum.ADMIN})
    @OperateLog(module = "费用核算", operation = "新增成本记录", description = "手动新增成本记录")
    public Result<Void> save(@Valid @RequestBody ProductionCostDTO dto) {
        productionCostService.saveCost(dto);
        return Result.success();
    }

    @Operation(summary = "修改成本记录")
    @PutMapping
    @RequiresRoles({RoleEnum.ADMIN})
    @OperateLog(module = "费用核算", operation = "修改成本记录", description = "修改成本记录信息")
    public Result<Void> update(@Valid @RequestBody ProductionCostDTO dto) {
        productionCostService.updateCost(dto);
        return Result.success();
    }

    @Operation(summary = "删除成本记录")
    @DeleteMapping("/{id}")
    @RequiresRoles({RoleEnum.ADMIN})
    @OperateLog(module = "费用核算", operation = "删除成本记录", description = "删除成本记录")
    public Result<Void> delete(@PathVariable Long id) {
        productionCostService.deleteCost(id);
        return Result.success();
    }

    @Operation(summary = "分页查询成本记录")
    @PostMapping("/page")
    public Result<PageResult<ProductionCost>> page(@RequestBody PageQuery query) {
        return Result.success(productionCostService.queryCostPage(query));
    }

    @Operation(summary = "获取成本记录详情")
    @GetMapping("/{id}")
    public Result<ProductionCost> getById(@PathVariable Long id) {
        return Result.success(productionCostService.getById(id));
    }

    @Operation(summary = "获取成本明细")
    @GetMapping("/detail/{costId}")
    public Result<List<CostDetail>> getCostDetails(@PathVariable Long costId) {
        return Result.success(productionCostService.getCostDetails(costId));
    }

    @Operation(summary = "获取工单成本明细")
    @GetMapping("/detail/work-order/{workOrderId}")
    public Result<List<CostDetail>> getWorkOrderCostDetails(@PathVariable Long workOrderId) {
        return Result.success(productionCostService.getWorkOrderCostDetails(workOrderId));
    }

    @Operation(summary = "生成月度报表")
    @PostMapping("/report/{reportMonth}")
    @RequiresRoles({RoleEnum.ADMIN})
    @OperateLog(module = "费用核算", operation = "生成月度报表", description = "生成月度成本报表")
    public Result<MonthlyReport> generateMonthlyReport(@PathVariable String reportMonth) {
        return Result.success(productionCostService.generateMonthlyReport(reportMonth));
    }

    @Operation(summary = "获取月度报表列表")
    @GetMapping("/report/list")
    public Result<List<MonthlyReport>> getMonthlyReports() {
        return Result.success(productionCostService.getMonthlyReports());
    }

    @Operation(summary = "获取月度报表详情")
    @GetMapping("/report/{reportMonth}")
    public Result<MonthlyReport> getMonthlyReport(@PathVariable String reportMonth) {
        return Result.success(productionCostService.getMonthlyReports().stream()
                .filter(r -> r.getReportMonth().equals(reportMonth))
                .findFirst()
                .orElse(null));
    }

    @Operation(summary = "计算单件产品成本")
    @GetMapping("/unit-cost/{workOrderId}")
    public Result<Map<String, Object>> calculateUnitCost(@PathVariable Long workOrderId) {
        return Result.success(productionCostService.calculateUnitCost(workOrderId));
    }

    @Operation(summary = "获取成本构成分析")
    @GetMapping("/composition/{workOrderId}")
    public Result<Map<String, Object>> getCostComposition(@PathVariable Long workOrderId) {
        return Result.success(productionCostService.getCostComposition(workOrderId));
    }

    @Operation(summary = "获取工单次品损失金额")
    @GetMapping("/defective-loss/{workOrderId}")
    public Result<BigDecimal> getTotalLossAmount(@PathVariable Long workOrderId) {
        return Result.success(productionCostService.getTotalLossAmount(workOrderId));
    }

    @Operation(summary = "获取工单次品成本详情")
    @GetMapping("/defective-cost/{workOrderId}")
    public Result<Map<String, Object>> getDefectiveCost(@PathVariable Long workOrderId) {
        return Result.success(productionCostService.getDefectiveCost(workOrderId));
    }
}
