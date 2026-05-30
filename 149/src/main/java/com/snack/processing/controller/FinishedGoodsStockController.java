package com.snack.processing.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.snack.processing.common.Result;
import com.snack.processing.dto.finishedgoods.FinishedGoodsInDTO;
import com.snack.processing.dto.finishedgoods.FinishedGoodsStockQueryDTO;
import com.snack.processing.entity.FinishedGoodsStock;
import com.snack.processing.service.FinishedGoodsStockService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/finished-goods")
@RequiredArgsConstructor
@Tag(name = "成品库存管理", description = "成品库存入库出库管理")
public class FinishedGoodsStockController {

    private final FinishedGoodsStockService stockService;

    @PostMapping("/stock-in")
    @Operation(summary = "成品入库")
    public Result<FinishedGoodsStock> stockIn(@Valid @RequestBody FinishedGoodsInDTO dto) {
        return stockService.stockIn(dto);
    }

    @PutMapping("/stock-out/{stockId}")
    @Operation(summary = "成品出库")
    public Result<Void> stockOut(@PathVariable Long stockId, @RequestParam BigDecimal quantity) {
        return stockService.stockOut(stockId, quantity);
    }

    @GetMapping("/page")
    @Operation(summary = "分页查询成品库存")
    public Result<IPage<FinishedGoodsStock>> getStockPage(FinishedGoodsStockQueryDTO dto) {
        return stockService.getStockPage(dto);
    }

    @GetMapping("/{id}")
    @Operation(summary = "获取成品库存详情")
    public Result<FinishedGoodsStock> getStockById(@PathVariable Long id) {
        return stockService.getStockById(id);
    }
}
