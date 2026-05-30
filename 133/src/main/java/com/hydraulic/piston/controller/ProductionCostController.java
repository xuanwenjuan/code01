package com.hydraulic.piston.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.hydraulic.piston.annotation.Log;
import com.hydraulic.piston.annotation.RequiresRole;
import com.hydraulic.piston.common.Result;
import com.hydraulic.piston.dto.ProductionCostDTO;
import com.hydraulic.piston.entity.ProductionCost;
import com.hydraulic.piston.service.ProductionCostService;
import com.hydraulic.piston.vo.MonthlyCostReportVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@Tag(name = "机加工生产成本接口")
@RestController
@RequestMapping("/api/production-cost")
@RequiredArgsConstructor
public class ProductionCostController {

    private final ProductionCostService costService;

    @Operation(summary = "分页查询成本记录")
    @GetMapping("/page")
    public Result<Page<ProductionCost>> getPage(
            @Parameter(description = "页码") @RequestParam(defaultValue = "1") Integer pageNum,
            @Parameter(description = "每页条数") @RequestParam(defaultValue = "10") Integer pageSize,
            @Parameter(description = "活塞型号") @RequestParam(required = false) String pistonModel,
            @Parameter(description = "统计年份") @RequestParam(required = false) Integer reportYear,
            @Parameter(description = "统计月份") @RequestParam(required = false) Integer reportMonth) {
        return Result.success(costService.getPage(pageNum, pageSize, pistonModel, reportYear, reportMonth));
    }

    @Operation(summary = "根据ID获取成本详情")
    @GetMapping("/{id}")
    public Result<ProductionCost> getById(@Parameter(description = "成本ID") @PathVariable Long id) {
        return Result.success(costService.getById(id));
    }

    @Operation(summary = "根据工单ID获取成本详情")
    @GetMapping("/order/{orderId}")
    public Result<ProductionCost> getByOrderId(@Parameter(description = "工单ID") @PathVariable Long orderId) {
        return Result.success(costService.getByOrderId(orderId));
    }

    @Operation(summary = "创建成本记录")
    @Log(module = "生产成本", operation = "创建成本记录")
    @RequiresRole({"MACHINING_TECHNICIAN", "ADMIN"})
    @PostMapping
    public Result<Void> create(@Valid @RequestBody ProductionCostDTO dto) {
        costService.create(dto);
        return Result.success("创建成功");
    }

    @Operation(summary = "更新成本记录")
    @Log(module = "生产成本", operation = "更新成本记录")
    @RequiresRole({"MACHINING_TECHNICIAN", "ADMIN"})
    @PutMapping
    public Result<Void> update(@Valid @RequestBody ProductionCostDTO dto) {
        costService.update(dto);
        return Result.success("更新成功");
    }

    @Operation(summary = "删除成本记录")
    @Log(module = "生产成本", operation = "删除成本记录")
    @RequiresRole({"MACHINING_TECHNICIAN", "ADMIN"})
    @DeleteMapping("/{id}")
    public Result<Void> delete(@Parameter(description = "成本ID") @PathVariable Long id) {
        costService.delete(id);
        return Result.success("删除成功");
    }

    @Operation(summary = "生成月度成本统计报表")
    @GetMapping("/monthly-report")
    public Result<MonthlyCostReportVO> generateMonthlyReport(
            @Parameter(description = "年份") @RequestParam Integer year,
            @Parameter(description = "月份") @RequestParam Integer month) {
        return Result.success(costService.generateMonthlyReport(year, month));
    }
}