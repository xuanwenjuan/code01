package com.stationery.manufacture.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.stationery.manufacture.common.RequireRole;
import com.stationery.manufacture.common.Result;
import com.stationery.manufacture.entity.ProductionOrder;
import com.stationery.manufacture.service.ProductionBusinessService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/production/business")
@Tag(name = "生产业务管理")
public class ProductionBusinessController {

    private final ProductionBusinessService productionBusinessService;

    public ProductionBusinessController(ProductionBusinessService productionBusinessService) {
        this.productionBusinessService = productionBusinessService;
    }

    @PutMapping("/{id}/schedule")
    @Operation(summary = "工单排产")
    @RequireRole({"PRODUCTION_LEADER", "ADMIN"})
    public Result<Void> scheduleOrder(
            @PathVariable Long id,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime planStartTime,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime planEndTime,
            @RequestParam Long productionUserId,
            @RequestParam String productionUserName,
            @RequestParam(required = false) Long designUserId,
            @RequestParam(required = false) String designUserName) {
        productionBusinessService.scheduleOrder(id, planStartTime, planEndTime,
                productionUserId, productionUserName, designUserId, designUserName);
        return Result.success();
    }

    @PutMapping("/{orderId}/allocate-materials")
    @Operation(summary = "工单领料")
    @RequireRole({"PRODUCTION_LEADER", "ADMIN"})
    public Result<Void> allocateMaterials(@PathVariable Long orderId) {
        productionBusinessService.allocateMaterials(orderId);
        return Result.success();
    }

    @PutMapping("/{orderId}/return-material")
    @Operation(summary = "工单退料")
    @RequireRole({"PRODUCTION_LEADER", "ADMIN"})
    public Result<Void> returnMaterial(
            @PathVariable Long orderId,
            @RequestParam Long materialId,
            @RequestParam BigDecimal quantity) {
        productionBusinessService.returnMaterial(orderId, materialId, quantity);
        return Result.success();
    }

    @PutMapping("/{orderId}/process/{processId}/start")
    @Operation(summary = "开始工序")
    @RequireRole({"PRODUCTION_LEADER", "ADMIN"})
    public Result<Void> startProcess(
            @PathVariable Long orderId,
            @PathVariable Long processId) {
        productionBusinessService.startProcess(orderId, processId);
        return Result.success();
    }

    @PutMapping("/{orderId}/process/{processId}/report")
    @Operation(summary = "工序报工")
    @RequireRole({"PRODUCTION_LEADER", "ADMIN"})
    public Result<Void> reportProcess(
            @PathVariable Long orderId,
            @PathVariable Long processId,
            @RequestParam BigDecimal workingHours,
            @RequestParam(required = false, defaultValue = "0") Integer outputQty,
            @RequestParam(required = false, defaultValue = "0") Integer defectiveQty,
            @RequestParam(required = false) String remark) {
        productionBusinessService.reportProcess(orderId, processId, workingHours, outputQty, defectiveQty, remark);
        return Result.success();
    }

    @PutMapping("/{id}/inspection")
    @Operation(summary = "质量检验")
    @RequireRole({"INSPECTOR", "ADMIN"})
    public Result<Void> qualityInspection(
            @PathVariable Long id,
            @RequestParam Integer qualified,
            @RequestParam Integer defective,
            @RequestParam(required = false) String remark) {
        productionBusinessService.qualityInspection(id, qualified, defective, remark);
        return Result.success();
    }

    @PutMapping("/{id}/finish")
    @Operation(summary = "工单完结")
    @RequireRole({"PRODUCTION_LEADER", "ADMIN"})
    public Result<Void> finishOrder(@PathVariable Long id) {
        productionBusinessService.finishOrder(id);
        return Result.success();
    }

    @PutMapping("/{id}/suspend")
    @Operation(summary = "暂停工单")
    @RequireRole({"PRODUCTION_LEADER", "ADMIN"})
    public Result<Void> suspendOrder(
            @PathVariable Long id,
            @RequestParam String reason) {
        productionBusinessService.suspendOrder(id, reason);
        return Result.success();
    }

    @PutMapping("/{id}/resume")
    @Operation(summary = "恢复工单")
    @RequireRole({"PRODUCTION_LEADER", "ADMIN"})
    public Result<Void> resumeOrder(@PathVariable Long id) {
        productionBusinessService.resumeOrder(id);
        return Result.success();
    }

    @GetMapping("/page")
    @Operation(summary = "按角色查询工单列表")
    @RequireRole({"PRODUCTION_LEADER", "ADMIN", "DESIGNER", "INSPECTOR"})
    public Result<Page<ProductionOrder>> getOrderPageByRole(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) Integer orderStatus,
            @RequestParam(required = false) String productName,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Integer priority) {
        return Result.success(productionBusinessService.getOrderPageByRole(
                pageNum, pageSize, orderStatus, productName, categoryId, priority));
    }

    @GetMapping("/{id}/progress")
    @Operation(summary = "工单进度")
    @RequireRole({"PRODUCTION_LEADER", "ADMIN", "DESIGNER", "INSPECTOR"})
    public Result<Map<String, Object>> getOrderProgress(@PathVariable Long id) {
        return Result.success(productionBusinessService.getOrderProgress(id));
    }

    @GetMapping("/dashboard")
    @Operation(summary = "车间看板")
    @RequireRole({"PRODUCTION_LEADER", "ADMIN"})
    public Result<List<Map<String, Object>>> getWorkshopDashboard() {
        return Result.success(productionBusinessService.getWorkshopDashboard());
    }
}
