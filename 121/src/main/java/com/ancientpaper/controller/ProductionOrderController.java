package com.ancientpaper.controller;

import com.ancientpaper.annotation.Log;
import com.ancientpaper.annotation.RequiresRole;
import com.ancientpaper.common.Result;
import com.ancientpaper.dto.ProductionOrderDTO;
import com.ancientpaper.entity.OrderMaterial;
import com.ancientpaper.entity.ProductionOrder;
import com.ancientpaper.service.ProductionOrderService;
import com.ancientpaper.validation.CreateGroup;
import com.baomidou.mybatisplus.core.metadata.IPage;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/order")
@RequiredArgsConstructor
@Validated
public class ProductionOrderController {

    private final ProductionOrderService orderService;

    @GetMapping("/page")
    public Result<IPage<ProductionOrder>> getOrderPage(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) Integer status,
            @RequestParam(required = false) Long categoryId) {
        return Result.success(orderService.getOrderPage(pageNum, pageSize, status, categoryId));
    }

    @GetMapping("/{id}")
    public Result<ProductionOrder> getOrderById(@PathVariable @Positive(message = "工单ID必须大于0") Long id) {
        return Result.success(orderService.getOrderById(id));
    }

    @GetMapping("/{id}/materials")
    public Result<List<OrderMaterial>> getOrderMaterials(@PathVariable @Positive(message = "工单ID必须大于0") Long id) {
        return Result.success(orderService.getOrderMaterials(id));
    }

    @PostMapping
    @RequiresRole({2, 4})
    @Log(module = "生产工单", type = "新增", desc = "创建生产工单")
    public Result<Void> createOrder(@Validated(CreateGroup.class) @RequestBody ProductionOrderDTO dto) {
        orderService.createOrder(dto);
        return Result.success();
    }

    @PutMapping("/{id}/soak/start")
    @RequiresRole({2, 4})
    @Log(module = "生产工单", type = "状态流转", desc = "开始浸泡")
    public Result<Void> startSoak(@PathVariable @Positive(message = "工单ID必须大于0") Long id) {
        orderService.startSoak(id);
        return Result.success();
    }

    @PutMapping("/{id}/soak/finish")
    @RequiresRole({2, 4})
    @Log(module = "生产工单", type = "状态流转", desc = "完成浸泡")
    public Result<Void> finishSoak(@PathVariable @Positive(message = "工单ID必须大于0") Long id) {
        orderService.finishSoak(id);
        return Result.success();
    }

    @PutMapping("/{id}/pulp/start")
    @RequiresRole({2, 4})
    @Log(module = "生产工单", type = "状态流转", desc = "开始捣料")
    public Result<Void> startPulp(@PathVariable @Positive(message = "工单ID必须大于0") Long id) {
        orderService.startPulp(id);
        return Result.success();
    }

    @PutMapping("/{id}/pulp/finish")
    @RequiresRole({2, 4})
    @Log(module = "生产工单", type = "状态流转", desc = "完成捣料")
    public Result<Void> finishPulp(@PathVariable @Positive(message = "工单ID必须大于0") Long id) {
        orderService.finishPulp(id);
        return Result.success();
    }

    @PutMapping("/{id}/paper/start")
    @RequiresRole({2, 4})
    @Log(module = "生产工单", type = "状态流转", desc = "开始抄纸")
    public Result<Void> startPaper(@PathVariable @Positive(message = "工单ID必须大于0") Long id) {
        orderService.startPaper(id);
        return Result.success();
    }

    @PutMapping("/{id}/paper/finish")
    @RequiresRole({2, 4})
    @Log(module = "生产工单", type = "状态流转", desc = "完成抄纸")
    public Result<Void> finishPaper(@PathVariable @Positive(message = "工单ID必须大于0") Long id) {
        orderService.finishPaper(id);
        return Result.success();
    }

    @PutMapping("/{id}/dry/start")
    @RequiresRole({2, 4})
    @Log(module = "生产工单", type = "状态流转", desc = "开始晾晒")
    public Result<Void> startDry(@PathVariable @Positive(message = "工单ID必须大于0") Long id) {
        orderService.startDry(id);
        return Result.success();
    }

    @PutMapping("/{id}/dry/finish")
    @RequiresRole({2, 4})
    @Log(module = "生产工单", type = "状态流转", desc = "完成晾晒")
    public Result<Void> finishDry(@PathVariable @Positive(message = "工单ID必须大于0") Long id) {
        orderService.finishDry(id);
        return Result.success();
    }

    @PutMapping("/{id}/calender/start")
    @RequiresRole({2, 4})
    @Log(module = "生产工单", type = "状态流转", desc = "开始砑光")
    public Result<Void> startCalender(@PathVariable @Positive(message = "工单ID必须大于0") Long id) {
        orderService.startCalender(id);
        return Result.success();
    }

    @PutMapping("/{id}/calender/finish")
    @RequiresRole({2, 4})
    @Log(module = "生产工单", type = "状态流转", desc = "完成砑光")
    public Result<Void> finishCalender(@PathVariable @Positive(message = "工单ID必须大于0") Long id) {
        orderService.finishCalender(id);
        return Result.success();
    }

    @PutMapping("/{id}/cut/start")
    @RequiresRole({2, 4})
    @Log(module = "生产工单", type = "状态流转", desc = "开始裁切")
    public Result<Void> startCut(@PathVariable @Positive(message = "工单ID必须大于0") Long id) {
        orderService.startCut(id);
        return Result.success();
    }

    @PutMapping("/{id}/cut/finish")
    @RequiresRole({2, 4})
    @Log(module = "生产工单", type = "状态流转", desc = "完成裁切")
    public Result<Void> finishCut(
            @PathVariable @Positive(message = "工单ID必须大于0") Long id,
            @RequestParam @Positive(message = "实际产量必须大于0") BigDecimal actualQuantity) {
        orderService.finishCut(id, actualQuantity);
        return Result.success();
    }

    @PutMapping("/{id}/warehouse")
    @RequiresRole({3, 4})
    @Log(module = "生产工单", type = "状态流转", desc = "产品入库")
    public Result<Void> inWarehouse(
            @PathVariable @Positive(message = "工单ID必须大于0") Long id,
            @RequestParam(defaultValue = "0") BigDecimal laborCost,
            @RequestParam(defaultValue = "0") BigDecimal workHourCost,
            @RequestParam(defaultValue = "0") BigDecimal waterCost,
            @RequestParam(defaultValue = "0") BigDecimal energyCost,
            @RequestParam(defaultValue = "0") BigDecimal equipmentLoss,
            @RequestParam(defaultValue = "0") BigDecimal wasteRate) {
        orderService.inWarehouse(id, laborCost, workHourCost, waterCost, energyCost, equipmentLoss, wasteRate);
        return Result.success();
    }

    @PutMapping("/{id}/cancel")
    @RequiresRole({4})
    @Log(module = "生产工单", type = "取消", desc = "取消生产工单")
    public Result<Void> cancelOrder(
            @PathVariable @Positive(message = "工单ID必须大于0") Long id,
            @RequestParam(required = false) String reason) {
        orderService.cancelOrder(id, reason);
        return Result.success();
    }
}
