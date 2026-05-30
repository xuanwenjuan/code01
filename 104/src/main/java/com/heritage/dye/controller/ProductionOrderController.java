package com.heritage.dye.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.heritage.dye.common.Result;
import com.heritage.dye.dto.OrderStepDTO;
import com.heritage.dye.dto.ProductionOrderDTO;
import com.heritage.dye.service.ProductionOrderService;
import com.heritage.dye.vo.ProductionOrderVO;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/production-order")
public class ProductionOrderController {

    @Autowired
    private ProductionOrderService productionOrderService;

    @PostMapping
    public Result<Void> create(@RequestBody @Valid ProductionOrderDTO dto) {
        productionOrderService.create(dto);
        return Result.success();
    }

    @GetMapping("/{id}")
    public Result<ProductionOrderVO> getById(@PathVariable Long id) {
        return Result.success(productionOrderService.getById(id));
    }

    @GetMapping("/page")
    public Result<Page<ProductionOrderVO>> page(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) Integer status,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long dyeCategoryId,
            @RequestParam(required = false) Long materialOriginId) {
        return Result.success(productionOrderService.page(pageNum, pageSize, status, keyword, dyeCategoryId, materialOriginId));
    }

    @PostMapping("/step/start")
    public Result<Void> startStep(@RequestBody @Valid OrderStepDTO dto) {
        productionOrderService.startStep(dto);
        return Result.success();
    }

    @PostMapping("/step/complete")
    public Result<Void> completeStep(@RequestBody @Valid OrderStepDTO dto) {
        productionOrderService.completeStep(dto);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    public Result<Void> cancelOrder(@PathVariable Long id) {
        productionOrderService.cancelOrder(id);
        return Result.success();
    }

    @GetMapping("/step-names")
    public Result<List<String>> getStepNames() {
        return Result.success(productionOrderService.getStepNames());
    }
}
