package com.liquor.brewing.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.liquor.brewing.annotation.Log;
import com.liquor.brewing.annotation.RequiresRole;
import com.liquor.brewing.common.Constants;
import com.liquor.brewing.common.PageQuery;
import com.liquor.brewing.common.PageResult;
import com.liquor.brewing.common.Result;
import com.liquor.brewing.entity.CostStatistics;
import com.liquor.brewing.entity.WorkOrderCost;
import com.liquor.brewing.entity.WorkOrderMaterial;
import com.liquor.brewing.service.CostService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.annotation.Resource;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "成本核算管理", description = "酿造成本核算管理接口")
@RestController
@RequestMapping("/cost")
public class CostController {

    @Resource
    private CostService costService;

    @Operation(summary = "分页查询工单成本列表")
    @GetMapping("/work-order/page")
    public Result<PageResult<WorkOrderCost>> costPage(
            @RequestParam(required = false) String month,
            PageQuery pageQuery) {
        IPage<WorkOrderCost> page = costService.costPage(month, pageQuery);
        return Result.success(PageResult.of(page));
    }

    @Operation(summary = "分页查询月度成本统计")
    @GetMapping("/statistics/page")
    public Result<PageResult<CostStatistics>> statisticsPage(PageQuery pageQuery) {
        IPage<CostStatistics> page = costService.statisticsPage(pageQuery);
        return Result.success(PageResult.of(page));
    }

    @Operation(summary = "核算工单成本")
    @PostMapping("/work-order/{workOrderId}/calculate")
    @RequiresRole(value = {Constants.RoleCode.SUPERVISOR}, message = "只有车间主管可以核算工单成本")
    @Log(module = "成本核算", operationType = Constants.OperationType.CREATE, description = "核算工单成本")
    public Result<WorkOrderCost> calculateWorkOrderCost(@PathVariable Long workOrderId) {
        return Result.success(costService.calculateWorkOrderCost(workOrderId));
    }

    @Operation(summary = "生成月度成本报表")
    @PostMapping("/statistics/generate")
    @RequiresRole(value = {Constants.RoleCode.SUPERVISOR}, message = "只有车间主管可以生成月度成本报表")
    @Log(module = "成本核算", operationType = Constants.OperationType.CREATE, description = "生成月度成本报表")
    public Result<Void> generateMonthlyStatistics() {
        costService.generateMonthlyStatistics();
        return Result.success();
    }

    @Operation(summary = "导出工单用料明细Excel")
    @GetMapping("/work-order/{workOrderId}/materials/excel")
    @RequiresRole(value = {Constants.RoleCode.SUPERVISOR}, message = "只有车间主管可以导出工单用料明细")
    @Log(module = "成本核算", operationType = Constants.OperationType.EXPORT, description = "导出工单用料明细Excel")
    public void exportWorkOrderMaterialsToExcel(@PathVariable Long workOrderId, HttpServletResponse response) {
        costService.exportWorkOrderMaterialsToExcel(workOrderId, response);
    }
}
