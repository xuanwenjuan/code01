package com.snack.processing.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.snack.processing.common.Result;
import com.snack.processing.dto.stockcheck.StockCheckAddDTO;
import com.snack.processing.dto.stockcheck.StockCheckQueryDTO;
import com.snack.processing.entity.StockCheck;
import com.snack.processing.service.StockCheckService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/stock-check")
@RequiredArgsConstructor
@Tag(name = "库存盘点", description = "材料库存盘点管理")
public class StockCheckController {

    private final StockCheckService stockCheckService;

    @PostMapping
    @Operation(summary = "创建盘点单")
    public Result<StockCheck> createStockCheck(@Valid @RequestBody StockCheckAddDTO dto) {
        return stockCheckService.createStockCheck(dto);
    }

    @PutMapping("/{id}/complete")
    @Operation(summary = "完成盘点")
    public Result<Void> completeStockCheck(@PathVariable Long id) {
        return stockCheckService.completeStockCheck(id);
    }

    @GetMapping("/{id}")
    @Operation(summary = "获取盘点单详情")
    public Result<StockCheck> getStockCheckDetail(@PathVariable Long id) {
        return stockCheckService.getStockCheckDetail(id);
    }

    @GetMapping("/page")
    @Operation(summary = "分页查询盘点单列表")
    public Result<IPage<StockCheck>> getStockCheckPage(StockCheckQueryDTO dto) {
        return stockCheckService.getStockCheckPage(dto);
    }
}
