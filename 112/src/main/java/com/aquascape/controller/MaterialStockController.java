package com.aquascape.controller;

import com.aquascape.annotation.OperationLog;
import com.aquascape.annotation.RequiresRole;
import com.aquascape.common.Result;
import com.aquascape.dto.MaterialStockDTO;
import com.aquascape.dto.MaterialStockQueryDTO;
import com.aquascape.entity.MaterialStock;
import com.aquascape.service.MaterialStockService;
import com.aquascape.vo.MaterialStockVO;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/stock")
public class MaterialStockController {

    @Autowired
    private MaterialStockService stockService;

    @PostMapping("/query")
    @RequiresRole({"ADMIN", "WAREHOUSE", "PURCHASER"})
    public Result<Page<MaterialStockVO>> query(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestBody MaterialStockQueryDTO queryDTO) {
        return Result.success(stockService.queryByConditions(page, size, queryDTO));
    }

    @GetMapping("/page")
    @RequiresRole({"ADMIN", "WAREHOUSE", "PURCHASER"})
    public Result<Page<MaterialStock>> page(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Integer stockStatus) {
        return Result.success(stockService.page(page, size, keyword, categoryId, stockStatus));
    }

    @GetMapping
    @RequiresRole({"ADMIN", "WAREHOUSE", "PURCHASER", "SCAPER"})
    public Result<List<MaterialStock>> list() {
        return Result.success(stockService.list());
    }

    @GetMapping("/available")
    @RequiresRole({"ADMIN", "WAREHOUSE", "PURCHASER", "SCAPER"})
    public Result<List<MaterialStock>> availableStock(@RequestParam(required = false) Long categoryId) {
        return Result.success(stockService.getAvailableStock(categoryId));
    }

    @GetMapping("/warning")
    @RequiresRole({"ADMIN", "WAREHOUSE"})
    public Result<List<MaterialStock>> warningList() {
        return Result.success(stockService.getWarningList());
    }

    @GetMapping("/{id}")
    @RequiresRole({"ADMIN", "WAREHOUSE", "PURCHASER"})
    public Result<MaterialStock> getById(@PathVariable Long id) {
        return Result.success(stockService.getById(id));
    }

    @PostMapping
    @RequiresRole({"ADMIN", "PURCHASER"})
    @OperationLog(module = "素材库存", operation = "新增库存")
    public Result<Void> create(@Valid @RequestBody MaterialStockDTO dto) {
        stockService.create(dto);
        return Result.success();
    }

    @PutMapping("/{id}")
    @RequiresRole({"ADMIN", "WAREHOUSE"})
    @OperationLog(module = "素材库存", operation = "编辑库存")
    public Result<Void> update(@PathVariable Long id, @Valid @RequestBody MaterialStockDTO dto) {
        stockService.update(id, dto);
        return Result.success();
    }

    @PutMapping("/{id}/stockIn")
    @RequiresRole({"ADMIN", "WAREHOUSE"})
    @OperationLog(module = "素材库存", operation = "入库操作")
    public Result<Void> stockIn(@PathVariable Long id, @RequestParam Integer quantity) {
        stockService.stockIn(id, quantity);
        return Result.success();
    }

    @PutMapping("/{id}/stockOut")
    @RequiresRole({"ADMIN", "WAREHOUSE"})
    @OperationLog(module = "素材库存", operation = "出库操作")
    public Result<Void> stockOut(@PathVariable Long id, @RequestParam Integer quantity) {
        stockService.stockOut(id, quantity);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    @RequiresRole({"ADMIN"})
    @OperationLog(module = "素材库存", operation = "删除库存")
    public Result<Void> delete(@PathVariable Long id) {
        stockService.delete(id);
        return Result.success();
    }
}
