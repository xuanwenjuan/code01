package com.gear.mfg.controller;

import com.gear.mfg.annotation.OperationLog;
import com.gear.mfg.annotation.RequireRole;
import com.gear.mfg.common.PageResult;
import com.gear.mfg.common.Result;
import com.gear.mfg.dto.MaterialStockQueryDTO;
import com.gear.mfg.entity.MaterialStock;
import com.gear.mfg.service.MaterialStockService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/stock")
@RequiredArgsConstructor
public class MaterialStockController {

    private final MaterialStockService materialStockService;

    @PostMapping("/query")
    @RequireRole({"ADMIN", "PURCHASE", "PROCESS_ENGINEER"})
    public Result<PageResult<MaterialStock>> queryStock(@Valid @RequestBody MaterialStockQueryDTO queryDTO) {
        PageResult<MaterialStock> pageResult = materialStockService.queryByConditions(queryDTO);
        return Result.success(pageResult);
    }

    @GetMapping("/{id}")
    @RequireRole({"ADMIN", "PURCHASE", "PROCESS_ENGINEER"})
    @Cacheable(value = "stock", key = "#id", unless = "#result == null")
    public Result<MaterialStock> getStockById(@PathVariable Long id) {
        MaterialStock stock = materialStockService.getById(id);
        return Result.success(stock);
    }

    @PostMapping
    @RequireRole({"ADMIN", "PURCHASE"})
    @OperationLog(module = "库存管理", operation = "新增库存", description = "新增坯料库存")
    @CacheEvict(value = "stock", allEntries = true)
    public Result<Void> createStock(@Valid @RequestBody MaterialStock stock) {
        materialStockService.save(stock);
        return Result.success();
    }

    @PutMapping
    @RequireRole({"ADMIN", "PURCHASE"})
    @OperationLog(module = "库存管理", operation = "更新库存", description = "更新坯料库存信息")
    @CacheEvict(value = "stock", key = "#stock.id")
    public Result<Void> updateStock(@Valid @RequestBody MaterialStock stock) {
        materialStockService.updateById(stock);
        return Result.success();
    }

    @PutMapping("/{id}/stop-procurement")
    @RequireRole({"ADMIN", "PURCHASE"})
    @OperationLog(module = "库存管理", operation = "停止采购", description = "设置物料停止采购状态")
    @CacheEvict(value = "stock", key = "#id")
    public Result<Void> stopProcurement(@PathVariable Long id) {
        MaterialStock stock = materialStockService.getById(id);
        stock.setStatus(3);
        materialStockService.updateById(stock);
        return Result.success();
    }

    @GetMapping("/warning/rust-proof")
    @RequireRole({"ADMIN", "PURCHASE"})
    public Result<PageResult<MaterialStock>> getRustProofWarningList(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize) {
        MaterialStockQueryDTO queryDTO = new MaterialStockQueryDTO();
        queryDTO.setPageNum(pageNum);
        queryDTO.setPageSize(pageSize);
        queryDTO.setRustProofWarning(true);
        PageResult<MaterialStock> pageResult = materialStockService.queryByConditions(queryDTO);
        return Result.success(pageResult);
    }
}
