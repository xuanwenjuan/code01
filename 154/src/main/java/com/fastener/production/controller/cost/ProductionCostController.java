package com.fastener.production.controller.cost;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.fastener.production.common.annotation.RequiresPermission;
import com.fastener.production.common.entity.PageQuery;
import com.fastener.production.common.result.Result;
import com.fastener.production.entity.cost.MonthlyProductionReport;
import com.fastener.production.entity.cost.ProductionCost;
import com.fastener.production.entity.cost.dto.CostSummaryDTO;
import com.fastener.production.entity.cost.dto.ProductionCostDTO;
import com.fastener.production.entity.cost.vo.CategoryCostVO;
import com.fastener.production.entity.cost.vo.WorkOrderCostVO;
import com.fastener.production.service.cost.ProductionCostService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "生产费用核算", description = "生产费用记录、工单成本核算、月度统计报表管理接口")
@RestController
@RequestMapping("/cost/production")
@RequiredArgsConstructor
public class ProductionCostController {

    private final ProductionCostService productionCostService;

    @Operation(summary = "分页查询费用记录")
    @GetMapping("/page")
    public Result<IPage<ProductionCost>> page(PageQuery pageQuery,
                                              @RequestParam(required = false) Integer costType,
                                              @RequestParam(required = false) Long workOrderId,
                                              @RequestParam(required = false) String costDateStart,
                                              @RequestParam(required = false) String costDateEnd) {
        return Result.success(productionCostService.page(pageQuery, costType, workOrderId, costDateStart, costDateEnd));
    }

    @Operation(summary = "生成费用编号")
    @GetMapping("/generateNo")
    @RequiresPermission("material:purchase")
    public Result<String> generateCostNo() {
        return Result.success(productionCostService.generateCostNo());
    }

    @Operation(summary = "获取费用详情")
    @GetMapping("/{id}")
    public Result<ProductionCost> getById(@PathVariable Long id) {
        return Result.success(productionCostService.getById(id));
    }

    @Operation(summary = "新增费用记录")
    @PostMapping
    @RequiresPermission("material:purchase")
    public Result<Void> add(@Valid @RequestBody ProductionCostDTO dto) {
        productionCostService.add(dto);
        return Result.success();
    }

    @Operation(summary = "修改费用记录")
    @PutMapping
    @RequiresPermission("material:purchase")
    public Result<Void> update(@Valid @RequestBody ProductionCostDTO dto) {
        productionCostService.update(dto);
        return Result.success();
    }

    @Operation(summary = "删除费用记录")
    @DeleteMapping("/{id}")
    @RequiresPermission("material:purchase")
    public Result<Void> delete(@PathVariable Long id) {
        productionCostService.delete(id);
        return Result.success();
    }

    @Operation(summary = "核算单个工单成本")
    @GetMapping("/workorder/{workOrderId}")
    @RequiresPermission("material:purchase")
    public Result<WorkOrderCostVO> calculateWorkOrderCost(@PathVariable Long workOrderId) {
        return Result.success(productionCostService.calculateWorkOrderCost(workOrderId));
    }

    @Operation(summary = "批量核算工单成本列表")
    @PostMapping("/workorder/list")
    @RequiresPermission("material:purchase")
    public Result<List<WorkOrderCostVO>> calculateWorkOrderCostList(@RequestBody(required = false) CostSummaryDTO dto) {
        return Result.success(productionCostService.calculateWorkOrderCostList(dto));
    }

    @Operation(summary = "按产品分类汇总成本")
    @PostMapping("/category/summary")
    @RequiresPermission("material:purchase")
    public Result<List<CategoryCostVO>> calculateCategoryCost(@RequestBody(required = false) CostSummaryDTO dto) {
        return Result.success(productionCostService.calculateCategoryCost(dto));
    }

    @Operation(summary = "工单完成自动记录成本")
    @PostMapping("/workorder/auto-record/{workOrderId}")
    @RequiresPermission("material:purchase")
    public Result<Void> autoRecordWorkOrderCost(@PathVariable Long workOrderId) {
        productionCostService.autoRecordWorkOrderCost(workOrderId);
        return Result.success();
    }

    @Operation(summary = "生成月度统计报表")
    @PostMapping("/report/generate/{reportMonth}")
    @RequiresPermission("material:purchase")
    public Result<MonthlyProductionReport> generateMonthlyReport(@PathVariable String reportMonth) {
        return Result.success(productionCostService.generateMonthlyReport(reportMonth));
    }

    @Operation(summary = "重新计算月度报表")
    @PostMapping("/report/recalculate/{reportMonth}")
    @RequiresPermission("material:purchase")
    public Result<Void> recalculateReport(@PathVariable String reportMonth) {
        productionCostService.recalculateReport(reportMonth);
        return Result.success();
    }

    @Operation(summary = "获取月度报表列表")
    @GetMapping("/report/list")
    public Result<List<MonthlyProductionReport>> getReportList(@RequestParam(required = false) String startMonth,
                                                               @RequestParam(required = false) String endMonth) {
        return Result.success(productionCostService.getReportList(startMonth, endMonth));
    }

    @Operation(summary = "获取指定月份报表")
    @GetMapping("/report/{reportMonth}")
    public Result<MonthlyProductionReport> getReportByMonth(@PathVariable String reportMonth) {
        return Result.success(productionCostService.getReportByMonth(reportMonth));
    }
}
