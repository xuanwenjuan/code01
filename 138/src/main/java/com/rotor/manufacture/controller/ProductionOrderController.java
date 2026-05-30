package com.rotor.manufacture.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.rotor.manufacture.annotation.RequiresRole;
import com.rotor.manufacture.common.Result;
import com.rotor.manufacture.dto.PageQueryDTO;
import com.rotor.manufacture.dto.ProcessCompleteDTO;
import com.rotor.manufacture.dto.ProductionOrderCreateDTO;
import com.rotor.manufacture.dto.ProductionOrderQueryDTO;
import com.rotor.manufacture.entity.OrderProcess;
import com.rotor.manufacture.entity.ProductionOrder;
import com.rotor.manufacture.service.ProductionOrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/order")
@RequiredArgsConstructor
public class ProductionOrderController {

    private final ProductionOrderService productionOrderService;

    @PostMapping
    @RequiresRole({"ADMIN", "PRODUCTION", "GROUP_LEADER"})
    public Result<Void> createOrder(@Valid @RequestBody ProductionOrderCreateDTO dto) {
        productionOrderService.createOrder(dto);
        return Result.success();
    }

    @PutMapping("/{id}/prepare")
    @RequiresRole({"ADMIN", "GROUP_LEADER"})
    public Result<Void> prepareMaterial(@PathVariable Long id) {
        productionOrderService.prepareMaterial(id);
        return Result.success();
    }

    @PutMapping("/{id}/start")
    @RequiresRole({"ADMIN", "GROUP_LEADER"})
    public Result<Void> startOrder(@PathVariable Long id) {
        productionOrderService.startOrder(id);
        return Result.success();
    }

    @PutMapping("/process/complete")
    @RequiresRole({"ADMIN", "PRODUCTION", "GROUP_LEADER"})
    public Result<Void> completeProcess(@Valid @RequestBody ProcessCompleteDTO dto) {
        productionOrderService.completeProcess(dto);
        return Result.success();
    }

    @PutMapping("/{id}/pause")
    @RequiresRole({"ADMIN", "GROUP_LEADER"})
    public Result<Void> pauseOrder(@PathVariable Long id) {
        productionOrderService.pauseOrder(id);
        return Result.success();
    }

    @PutMapping("/{id}/resume")
    @RequiresRole({"ADMIN", "GROUP_LEADER"})
    public Result<Void> resumeOrder(@PathVariable Long id) {
        productionOrderService.resumeOrder(id);
        return Result.success();
    }

    @GetMapping("/list")
    public Result<List<ProductionOrder>> list() {
        List<ProductionOrder> list = productionOrderService.list();
        return Result.success(list);
    }

    @PostMapping("/page")
    public Result<Page<ProductionOrder>> pageQuery(@RequestBody PageQueryDTO queryDTO) {
        Page<ProductionOrder> page = productionOrderService.pageQuery(queryDTO);
        return Result.success(page);
    }

    @PostMapping("/query")
    public Result<Page<ProductionOrder>> queryByConditions(@Valid @RequestBody ProductionOrderQueryDTO queryDTO) {
        Page<ProductionOrder> page = productionOrderService.queryByConditions(queryDTO);
        return Result.success(page);
    }

    @GetMapping("/{id}")
    public Result<ProductionOrder> getById(@PathVariable Long id) {
        ProductionOrder order = productionOrderService.getById(id);
        return Result.success(order);
    }

    @GetMapping("/{orderId}/processes")
    public Result<List<OrderProcess>> getProcessesByOrderId(@PathVariable Long orderId) {
        List<OrderProcess> processes = productionOrderService.getProcessesByOrderId(orderId);
        return Result.success(processes);
    }
}