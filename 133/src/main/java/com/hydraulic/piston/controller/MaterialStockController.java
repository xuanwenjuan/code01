package com.hydraulic.piston.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.hydraulic.piston.annotation.Log;
import com.hydraulic.piston.annotation.RequiresRole;
import com.hydraulic.piston.common.Result;
import com.hydraulic.piston.dto.MaterialStockDTO;
import com.hydraulic.piston.entity.MaterialStock;
import com.hydraulic.piston.service.MaterialStockService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@Tag(name = "棒料原料仓储接口")
@RestController
@RequestMapping("/api/material-stock")
@RequiredArgsConstructor
public class MaterialStockController {

    private final MaterialStockService stockService;

    @Operation(summary = "分页查询原料库存（多条件组合）")
    @GetMapping("/page")
    public Result<Page<MaterialStock>> getPage(
            @Parameter(description = "页码") @RequestParam(defaultValue = "1") Integer pageNum,
            @Parameter(description = "每页条数") @RequestParam(defaultValue = "10") Integer pageSize,
            @Parameter(description = "原料类型") @RequestParam(required = false) String materialType,
            @Parameter(description = "原料名称") @RequestParam(required = false) String materialName,
            @Parameter(description = "钢材材质牌号") @RequestParam(required = false) String steelGrade,
            @Parameter(description = "规格型号") @RequestParam(required = false) String specification,
            @Parameter(description = "库存状态") @RequestParam(required = false) Integer stockStatus) {
        return Result.success(stockService.getPage(pageNum, pageSize, materialType, materialName, steelGrade, specification, stockStatus));
    }

    @Operation(summary = "查询原料列表（不分页）")
    @GetMapping("/list")
    public Result<List<MaterialStock>> getList(
            @Parameter(description = "原料类型") @RequestParam(required = false) String materialType,
            @Parameter(description = "原料名称") @RequestParam(required = false) String materialName,
            @Parameter(description = "钢材材质牌号") @RequestParam(required = false) String steelGrade,
            @Parameter(description = "规格型号") @RequestParam(required = false) String specification,
            @Parameter(description = "库存状态") @RequestParam(required = false) Integer stockStatus) {
        return Result.success(stockService.getList(materialType, materialName, steelGrade, specification, stockStatus));
    }

    @Operation(summary = "根据ID获取原料详情")
    @GetMapping("/{id}")
    public Result<MaterialStock> getById(@Parameter(description = "原料ID") @PathVariable Long id) {
        return Result.success(stockService.getById(id));
    }

    @Operation(summary = "原料入库")
    @Log(module = "原料仓储", operation = "原料入库")
    @RequiresRole({"MATERIAL_PURCHASER", "ADMIN"})
    @PostMapping("/inbound")
    public Result<Void> inbound(@Valid @RequestBody MaterialStockDTO dto) {
        stockService.inbound(dto);
        return Result.success("入库成功");
    }

    @Operation(summary = "更新原料信息")
    @Log(module = "原料仓储", operation = "更新原料信息")
    @RequiresRole({"MATERIAL_PURCHASER", "ADMIN"})
    @PutMapping
    public Result<Void> update(@Valid @RequestBody MaterialStockDTO dto) {
        stockService.update(dto);
        return Result.success("更新成功");
    }

    @Operation(summary = "原料出库")
    @Log(module = "原料仓储", operation = "原料出库")
    @RequiresRole({"MATERIAL_PURCHASER", "CNC_TEAM_LEADER", "ADMIN"})
    @PostMapping("/{id}/outbound")
    public Result<Void> outbound(
            @Parameter(description = "原料ID") @PathVariable Long id,
            @Parameter(description = "出库数量") @RequestParam BigDecimal quantity,
            @Parameter(description = "备注") @RequestParam(required = false) String remark) {
        stockService.outbound(id, quantity, remark);
        return Result.success("出库成功");
    }

    @Operation(summary = "锁定原料库存")
    @Log(module = "原料仓储", operation = "锁定原料库存")
    @RequiresRole({"MACHINING_TECHNICIAN", "CNC_TEAM_LEADER", "ADMIN"})
    @PostMapping("/{id}/lock")
    public Result<Void> lockStock(
            @Parameter(description = "原料ID") @PathVariable Long id,
            @Parameter(description = "工单ID") @RequestParam Long orderId,
            @Parameter(description = "锁定数量") @RequestParam BigDecimal quantity) {
        stockService.lockStock(id, orderId, quantity);
        return Result.success("锁定成功");
    }

    @Operation(summary = "解锁原料库存")
    @Log(module = "原料仓储", operation = "解锁原料库存")
    @RequiresRole({"MACHINING_TECHNICIAN", "CNC_TEAM_LEADER", "ADMIN"})
    @PostMapping("/{id}/unlock")
    public Result<Void> unlockStock(@Parameter(description = "原料ID") @PathVariable Long id) {
        stockService.unlockStock(id);
        return Result.success("解锁成功");
    }

    @Operation(summary = "删除原料记录")
    @Log(module = "原料仓储", operation = "删除原料记录")
    @RequiresRole({"MATERIAL_PURCHASER", "ADMIN"})
    @DeleteMapping("/{id}")
    public Result<Void> delete(@Parameter(description = "原料ID") @PathVariable Long id) {
        stockService.delete(id);
        return Result.success("删除成功");
    }

    @Operation(summary = "获取库存预警列表")
    @GetMapping("/warning")
    public Result<List<MaterialStock>> getWarningList() {
        return Result.success(stockService.getWarningList());
    }

    @Operation(summary = "获取即将过期列表")
    @GetMapping("/expiring")
    public Result<List<MaterialStock>> getExpiringList() {
        return Result.success(stockService.getExpiringList());
    }
}
