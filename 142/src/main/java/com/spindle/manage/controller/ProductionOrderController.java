package com.spindle.manage.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.spindle.manage.annotation.RequiresPermission;
import com.spindle.manage.common.Result;
import com.spindle.manage.dto.*;
import com.spindle.manage.entity.OrderMaterialDetail;
import com.spindle.manage.entity.OrderProcessRecord;
import com.spindle.manage.entity.ProductionOrder;
import com.spindle.manage.mapper.OrderMaterialDetailMapper;
import com.spindle.manage.service.MaterialInventoryService;
import com.spindle.manage.service.ProductionOrderService;
import com.spindle.manage.utils.UserContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/production")
@RequiredArgsConstructor
public class ProductionOrderController {

    private final ProductionOrderService productionOrderService;
    private final MaterialInventoryService materialInventoryService;
    private final OrderMaterialDetailMapper orderMaterialDetailMapper;

    @RequiresPermission("production:list")
    @GetMapping("/list")
    public Result<IPage<ProductionOrder>> list(@RequestParam(defaultValue = "1") Integer current,
                                               @RequestParam(defaultValue = "10") Integer size,
                                               @RequestParam(required = false) String orderNo,
                                               @RequestParam(required = false) Integer orderStatus,
                                               @RequestParam(required = false) Long categoryId) {
        Page<ProductionOrder> page = new Page<>(current, size);
        IPage<ProductionOrder> result = productionOrderService.getOrderPage(page, orderNo, orderStatus, categoryId);
        return Result.success(result);
    }

    @RequiresPermission("production:query")
    @PostMapping("/query")
    public Result<IPage<ProductionOrder>> query(@RequestBody ProductionOrderQueryDTO dto) {
        Page<ProductionOrder> page = new Page<>(dto.getCurrent(), dto.getSize());
        IPage<ProductionOrder> result = productionOrderService.queryByConditions(page, dto);
        return Result.success(result);
    }

    @RequiresPermission("production:get")
    @GetMapping("/{id}")
    public Result<ProductionOrder> getById(@PathVariable Long id) {
        ProductionOrder order = productionOrderService.getById(id);
        return Result.success(order);
    }

    @RequiresPermission("production:create")
    @PostMapping
    public Result<Boolean> create(@RequestBody ProductionOrder order) {
        boolean result = productionOrderService.createOrder(order);
        return Result.success(result);
    }

    @RequiresPermission("production:process")
    @PostMapping("/process/start")
    public Result<Boolean> startProcess(@RequestBody StartProcessDTO dto) {
        boolean result = productionOrderService.startProcess(
                dto.getOrderId(),
                dto.getProcessCode(),
                UserContext.getUserId()
        );
        return Result.success(result);
    }

    @RequiresPermission("production:process")
    @PostMapping("/process/complete")
    public Result<Boolean> completeProcess(@RequestBody CompleteProcessDTO dto) {
        boolean result = productionOrderService.completeProcess(
                dto.getOrderId(),
                dto.getProcessCode(),
                UserContext.getUserId(),
                dto.getRemark()
        );
        return Result.success(result);
    }

    @RequiresPermission("production:quality")
    @PostMapping("/quality")
    public Result<Boolean> qualityCheck(@RequestBody QualityCheckDTO dto) {
        boolean result = productionOrderService.qualityCheck(dto);
        return Result.success(result);
    }

    @RequiresPermission("production:loss")
    @PostMapping("/loss/record")
    public Result<Boolean> recordLoss(@RequestBody RecordLossDTO dto) {
        boolean result = productionOrderService.recordProductionLoss(
                dto.getOrderId(),
                dto.getProcessCode(),
                dto.getLossType(),
                dto.getMaterialName(),
                dto.getLossQuantity(),
                dto.getLossAmount(),
                dto.getRemark()
        );
        return Result.success(result);
    }

    @RequiresPermission("production:process")
    @GetMapping("/process/records/{orderId}")
    public Result<List<OrderProcessRecord>> getProcessRecords(@PathVariable Long orderId) {
        List<OrderProcessRecord> records = productionOrderService.getProcessRecords(orderId);
        return Result.success(records);
    }

    @RequiresPermission("production:pause")
    @PostMapping("/pause")
    public Result<Boolean> pauseOrder(@RequestBody PauseOrderDTO dto) {
        boolean result = productionOrderService.pauseOrder(dto.getOrderId(), dto.getReason());
        return Result.success(result);
    }

    @RequiresPermission("production:resume")
    @PostMapping("/resume")
    public Result<Boolean> resumeOrder(@RequestParam Long orderId) {
        boolean result = productionOrderService.resumeOrder(orderId);
        return Result.success(result);
    }

    @RequiresPermission("production:cancel")
    @PostMapping("/cancel")
    public Result<Boolean> cancelOrder(@RequestBody CancelOrderDTO dto) {
        boolean result = productionOrderService.cancelOrder(dto.getOrderId(), dto.getReason());
        return Result.success(result);
    }

    @RequiresPermission("production:quality")
    @PostMapping("/finalQuality")
    public Result<Boolean> finalQualityCheck(@RequestBody FinalQualityDTO dto) {
        boolean result = productionOrderService.finalQualityCheck(
                dto.getOrderId(),
                dto.getResult(),
                dto.getRemark()
        );
        return Result.success(result);
    }

    @RequiresPermission("production:material")
    @PostMapping("/material/add")
    public Result<Boolean> addMaterialDetail(@RequestBody OrderMaterialDetailDTO dto) {
        boolean result = productionOrderService.addOrderMaterialDetail(dto);
        return Result.success(result);
    }

    @RequiresPermission("production:material")
    @PostMapping("/material/batchAdd")
    public Result<Boolean> batchAddMaterialDetail(@RequestBody List<OrderMaterialDetailDTO> list) {
        boolean result = productionOrderService.batchAddOrderMaterialDetail(list);
        return Result.success(result);
    }

    @RequiresPermission("production:material")
    @PostMapping("/material/lock")
    public Result<Boolean> lockInventory(@RequestBody LockInventoryDTO dto) {
        materialInventoryService.lockInventory(
                dto.getOrderId(),
                dto.getMaterialId(),
                dto.getLockQuantity()
        );
        return Result.success(true);
    }

    @RequiresPermission("production:material")
    @PostMapping("/material/release")
    public Result<Boolean> releaseInventory(@RequestBody ReleaseInventoryDTO dto) {
        materialInventoryService.releaseInventory(
                dto.getOrderId(),
                dto.getMaterialId()
        );
        return Result.success(true);
    }

    @RequiresPermission("production:material")
    @GetMapping("/material/list/{orderId}")
    public Result<List<OrderMaterialDetail>> getMaterialDetails(@PathVariable Long orderId) {
        List<OrderMaterialDetail> list = orderMaterialDetailMapper.selectList(
                new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<OrderMaterialDetail>()
                        .eq(OrderMaterialDetail::getOrderId, orderId)
        );
        return Result.success(list);
    }

}
