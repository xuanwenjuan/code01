package com.hydraulic.piston.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.hydraulic.piston.annotation.Log;
import com.hydraulic.piston.annotation.RequiresRole;
import com.hydraulic.piston.common.Result;
import com.hydraulic.piston.dto.ProcessCompleteDTO;
import com.hydraulic.piston.dto.ProductionOrderDTO;
import com.hydraulic.piston.dto.QualityCheckDTO;
import com.hydraulic.piston.entity.ProductionOrder;
import com.hydraulic.piston.service.ProductionOrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "数控机加生产工单接口")
@RestController
@RequestMapping("/api/production-order")
@RequiredArgsConstructor
public class ProductionOrderController {

    private final ProductionOrderService orderService;

    @Operation(summary = "分页查询工单")
    @GetMapping("/page")
    public Result<Page<ProductionOrder>> getPage(
            @Parameter(description = "页码") @RequestParam(defaultValue = "1") Integer pageNum,
            @Parameter(description = "每页条数") @RequestParam(defaultValue = "10") Integer pageSize,
            @Parameter(description = "活塞型号") @RequestParam(required = false) String pistonModel,
            @Parameter(description = "工单状态") @RequestParam(required = false) Integer status,
            @Parameter(description = "当前工序") @RequestParam(required = false) Integer currentProcess) {
        return Result.success(orderService.getPage(pageNum, pageSize, pistonModel, status, currentProcess));
    }

    @Operation(summary = "查询工单列表(不分页)")
    @GetMapping("/list")
    public Result<List<ProductionOrder>> getList(
            @Parameter(description = "活塞型号") @RequestParam(required = false) String pistonModel,
            @Parameter(description = "工单状态") @RequestParam(required = false) Integer status,
            @Parameter(description = "当前工序") @RequestParam(required = false) Integer currentProcess) {
        return Result.success(orderService.getList(pistonModel, status, currentProcess));
    }

    @Operation(summary = "根据ID获取工单详情")
    @GetMapping("/{id}")
    public Result<ProductionOrder> getById(@Parameter(description = "工单ID") @PathVariable Long id) {
        return Result.success(orderService.getById(id));
    }

    @Operation(summary = "创建工单")
    @Log(module = "生产工单", operation = "创建工单")
    @RequiresRole({"MACHINING_TECHNICIAN", "ADMIN"})
    @PostMapping
    public Result<Void> create(@Valid @RequestBody ProductionOrderDTO dto) {
        orderService.create(dto);
        return Result.success("创建成功");
    }

    @Operation(summary = "确认加工工艺并锁定原料")
    @Log(module = "生产工单", operation = "确认加工工艺并锁定原料")
    @RequiresRole({"MACHINING_TECHNICIAN", "ADMIN"})
    @PostMapping("/{id}/confirm-process")
    public Result<Void> confirmProcess(@Parameter(description = "工单ID") @PathVariable Long id) {
        orderService.confirmProcess(id);
        return Result.success("工艺确认成功，原料已锁定");
    }

    @Operation(summary = "开始工单")
    @Log(module = "生产工单", operation = "开始工单")
    @RequiresRole({"CNC_TEAM_LEADER", "ADMIN"})
    @PostMapping("/{id}/start")
    public Result<Void> start(@Parameter(description = "工单ID") @PathVariable Long id) {
        orderService.start(id);
        return Result.success("工单已开始");
    }

    @Operation(summary = "完成工序")
    @Log(module = "生产工单", operation = "完成工序")
    @RequiresRole({"CNC_TEAM_LEADER", "ADMIN"})
    @PostMapping("/process-complete")
    public Result<Void> completeProcess(@Valid @RequestBody ProcessCompleteDTO dto) {
        orderService.completeProcess(dto);
        return Result.success("工序完成");
    }

    @Operation(summary = "质检入库并自动计算成本")
    @Log(module = "生产工单", operation = "质检入库并自动计算成本")
    @RequiresRole({"QUALITY_INSPECTOR", "ADMIN"})
    @PostMapping("/quality-check")
    public Result<Void> qualityCheck(@Valid @RequestBody QualityCheckDTO dto) {
        orderService.qualityCheck(dto);
        return Result.success("质检完成，成本已自动核算");
    }

    @Operation(summary = "暂停工单")
    @Log(module = "生产工单", operation = "暂停工单")
    @RequiresRole({"CNC_TEAM_LEADER", "ADMIN"})
    @PostMapping("/{id}/pause")
    public Result<Void> pause(@Parameter(description = "工单ID") @PathVariable Long id) {
        orderService.pause(id);
        return Result.success("工单已暂停");
    }

    @Operation(summary = "恢复工单")
    @Log(module = "生产工单", operation = "恢复工单")
    @RequiresRole({"CNC_TEAM_LEADER", "ADMIN"})
    @PostMapping("/{id}/resume")
    public Result<Void> resume(@Parameter(description = "工单ID") @PathVariable Long id) {
        orderService.resume(id);
        return Result.success("工单已恢复");
    }

    @Operation(summary = "取消工单并解锁原料")
    @Log(module = "生产工单", operation = "取消工单并解锁原料")
    @RequiresRole({"MACHINING_TECHNICIAN", "CNC_TEAM_LEADER", "ADMIN"})
    @PostMapping("/{id}/cancel")
    public Result<Void> cancel(@Parameter(description = "工单ID") @PathVariable Long id) {
        orderService.cancel(id);
        return Result.success("工单已取消");
    }
}