package com.snack.processing.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.snack.processing.common.Result;
import com.snack.processing.dto.material.MaterialAddDTO;
import com.snack.processing.dto.material.MaterialQueryDTO;
import com.snack.processing.dto.material.StockInDTO;
import com.snack.processing.dto.material.StockQueryDTO;
import com.snack.processing.entity.Material;
import com.snack.processing.entity.MaterialStock;
import com.snack.processing.service.MaterialService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/material")
@RequiredArgsConstructor
@Tag(name = "原辅材料管理", description = "原辅材料及库存管理")
public class MaterialController {

    private final MaterialService materialService;

    @PostMapping
    @Operation(summary = "新增材料")
    public Result<Void> addMaterial(@Valid @RequestBody MaterialAddDTO dto) {
        return materialService.addMaterial(dto);
    }

    @PutMapping("/{id}")
    @Operation(summary = "更新材料")
    public Result<Void> updateMaterial(@PathVariable Long id, @Valid @RequestBody MaterialAddDTO dto) {
        return materialService.updateMaterial(id, dto);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "删除材料")
    public Result<Void> deleteMaterial(@PathVariable Long id) {
        return materialService.deleteMaterial(id);
    }

    @PutMapping("/{id}/disable-purchase")
    @Operation(summary = "禁止采购")
    public Result<Void> disablePurchase(@PathVariable Long id) {
        return materialService.disablePurchase(id);
    }

    @PutMapping("/{id}/enable-purchase")
    @Operation(summary = "允许采购")
    public Result<Void> enablePurchase(@PathVariable Long id) {
        return materialService.enablePurchase(id);
    }

    @GetMapping("/{id}")
    @Operation(summary = "获取材料详情")
    public Result<Material> getMaterialById(@PathVariable Long id) {
        return materialService.getMaterialById(id);
    }

    @GetMapping("/page")
    @Operation(summary = "分页查询材料列表")
    public Result<IPage<Material>> getMaterialPage(MaterialQueryDTO dto) {
        return materialService.getMaterialPage(dto);
    }

    @PostMapping("/stock-in")
    @Operation(summary = "材料入库")
    public Result<MaterialStock> stockIn(@Valid @RequestBody StockInDTO dto) {
        return materialService.stockIn(dto);
    }

    @PutMapping("/stock-out/{stockId}")
    @Operation(summary = "材料出库")
    public Result<Void> stockOut(@PathVariable Long stockId, @RequestParam BigDecimal quantity) {
        return materialService.stockOut(stockId, quantity);
    }

    @PutMapping("/stock-lock/{stockId}")
    @Operation(summary = "锁定库存")
    public Result<Void> lockStock(@PathVariable Long stockId, @RequestParam BigDecimal quantity) {
        return materialService.lockStock(stockId, quantity);
    }

    @PutMapping("/stock-unlock/{stockId}")
    @Operation(summary = "解锁库存")
    public Result<Void> unlockStock(@PathVariable Long stockId, @RequestParam BigDecimal quantity) {
        return materialService.unlockStock(stockId, quantity);
    }

    @GetMapping("/stock/page")
    @Operation(summary = "分页查询库存列表")
    public Result<IPage<MaterialStock>> getStockPage(StockQueryDTO dto) {
        return materialService.getStockPage(dto);
    }

    @GetMapping("/stock/{id}")
    @Operation(summary = "获取库存详情")
    public Result<MaterialStock> getStockById(@PathVariable Long id) {
        return materialService.getStockById(id);
    }

    @GetMapping("/stock/warning-count")
    @Operation(summary = "获取预警库存数量")
    public Result<Long> getWarningStockCount() {
        return materialService.getWarningStockCount();
    }

    @GetMapping("/stock/expiring-count")
    @Operation(summary = "获取临期库存数量")
    public Result<Long> getExpiringStockCount() {
        return materialService.getExpiringStockCount();
    }

    @GetMapping("/stock/traceability/{batchNo}")
    @Operation(summary = "批次追溯查询")
    public Result<Map<String, Object>> getBatchTraceability(@PathVariable String batchNo) {
        return materialService.getBatchTraceability(batchNo);
    }

    @GetMapping("/stock/summary")
    @Operation(summary = "获取库存汇总")
    public Result<List<Map<String, Object>>> getStockSummary() {
        return materialService.getStockSummary();
    }
}
