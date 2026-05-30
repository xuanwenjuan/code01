package com.motor.core.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.motor.core.annotation.OperationLog;
import com.motor.core.annotation.RequiresRole;
import com.motor.core.common.Result;
import com.motor.core.constants.RoleConstants;
import com.motor.core.dto.ProcessCompleteDTO;
import com.motor.core.dto.ProductionOrderCreateDTO;
import com.motor.core.service.ProductionOrderService;
import com.motor.core.vo.ProductionOrderVO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/order")
@RequiredArgsConstructor
public class ProductionOrderController {
    private final ProductionOrderService productionOrderService;

    @GetMapping("/page")
    @OperationLog(module = "工单管理", operation = "分页查询", description = "分页查询生产工单")
    public Result<Page<ProductionOrderVO>> queryPage(
            @RequestParam(defaultValue = "1") int pageNum,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(required = false) Integer status,
            @RequestParam(required = false) Long categoryId) {
        return Result.success(productionOrderService.queryPage(pageNum, pageSize, status, categoryId));
    }

    @GetMapping("/{id}")
    @OperationLog(module = "工单管理", operation = "查询详情", description = "查询工单详情")
    public Result<ProductionOrderVO> getById(@PathVariable Long id) {
        return Result.success(productionOrderService.getDetailById(id));
    }

    @PostMapping
    @RequiresRole(RoleConstants.PRODUCTION_LEADER)
    @OperationLog(module = "工单管理", operation = "创建工单", description = "生产组长创建工单")
    public Result<ProductionOrderVO> create(@Valid @RequestBody ProductionOrderCreateDTO dto) {
        return Result.success(productionOrderService.createOrder(dto));
    }

    @PutMapping
    @RequiresRole(RoleConstants.PRODUCTION_LEADER)
    @OperationLog(module = "工单管理", operation = "更新工单", description = "生产组长更新工单")
    public Result<Void> update(@RequestBody ProductionOrderVO orderVO) {
        return Result.error("请使用Service层更新");
    }

    @DeleteMapping("/{id}")
    @RequiresRole(RoleConstants.PRODUCTION_LEADER)
    @OperationLog(module = "工单管理", operation = "删除工单", description = "生产组长删除工单")
    public Result<Void> delete(@PathVariable Long id) {
        boolean success = productionOrderService.removeById(id);
        return success ? Result.success() : Result.error("删除失败");
    }

    @PostMapping("/{id}/process/{processCode}/start")
    @RequiresRole(RoleConstants.PRODUCTION_LEADER)
    @OperationLog(module = "工单管理", operation = "开始工序", description = "开始生产工序")
    public Result<Void> startProcess(
            @PathVariable Long id,
            @PathVariable String processCode,
            @RequestParam Long operatorId) {
        boolean success = productionOrderService.startProcess(id, processCode, operatorId);
        return success ? Result.success("工序开始成功", null) : Result.error("工序开始失败");
    }

    @PostMapping("/process/complete")
    @RequiresRole({RoleConstants.PRODUCTION_LEADER, RoleConstants.QUALITY_SUPERVISOR})
    @OperationLog(module = "工单管理", operation = "完成工序", description = "完成生产工序")
    public Result<Void> completeProcess(@Valid @RequestBody ProcessCompleteDTO dto) {
        boolean success = productionOrderService.completeProcess(dto);
        return success ? Result.success("工序完成成功", null) : Result.error("工序完成失败");
    }

    @PostMapping("/{id}/suspend")
    @RequiresRole(RoleConstants.PRODUCTION_LEADER)
    @OperationLog(module = "工单管理", operation = "搁置工单", description = "搁置生产工单")
    public Result<Void> suspendOrder(@PathVariable Long id) {
        boolean success = productionOrderService.suspendOrder(id);
        return success ? Result.success("工单搁置成功", null) : Result.error("工单搁置失败");
    }
}
