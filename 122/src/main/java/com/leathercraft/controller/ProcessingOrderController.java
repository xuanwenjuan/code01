package com.leathercraft.controller;

import com.leathercraft.annotation.RequiresRole;
import com.leathercraft.common.Result;
import com.leathercraft.dto.OrderCompleteDTO;
import com.leathercraft.dto.OrderProcessDTO;
import com.leathercraft.dto.ProcessingOrderDTO;
import com.leathercraft.dto.ProcessingOrderQueryDTO;
import com.leathercraft.enums.RoleEnum;
import com.leathercraft.service.ProcessingOrderService;
import com.leathercraft.vo.OrderMaterialVO;
import com.leathercraft.vo.ProcessingOrderVO;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Validated
@RestController
@RequestMapping("/api/order")
@RequiredArgsConstructor
public class ProcessingOrderController {

    private final ProcessingOrderService processingOrderService;

    @PostMapping
    @RequiresRole({RoleEnum.ADMIN, RoleEnum.TANNER})
    public Result<Void> create(@RequestBody @Valid ProcessingOrderDTO dto) {
        processingOrderService.create(dto);
        return Result.success();
    }

    @PutMapping("/{id}/soften/start")
    @RequiresRole({RoleEnum.ADMIN, RoleEnum.TANNER})
    public Result<Void> startSoftening(@PathVariable @NotNull(message = "工单ID不能为空") Long id) {
        processingOrderService.startSoftening(id);
        return Result.success();
    }

    @PutMapping("/{id}/soften/finish")
    @RequiresRole({RoleEnum.ADMIN, RoleEnum.TANNER})
    public Result<Void> finishSoftening(@PathVariable @NotNull(message = "工单ID不能为空") Long id) {
        processingOrderService.finishSoftening(id);
        return Result.success();
    }

    @PutMapping("/{id}/tanning/start")
    @RequiresRole({RoleEnum.ADMIN, RoleEnum.TANNER})
    public Result<Void> startTanning(@PathVariable @NotNull(message = "工单ID不能为空") Long id,
                                      @RequestBody @Valid OrderProcessDTO dto) {
        dto.setOrderId(id);
        processingOrderService.startTanning(id, dto);
        return Result.success();
    }

    @PutMapping("/{id}/tanning/finish")
    @RequiresRole({RoleEnum.ADMIN, RoleEnum.TANNER})
    public Result<Void> finishTanning(@PathVariable @NotNull(message = "工单ID不能为空") Long id,
                                      @RequestBody @Valid OrderProcessDTO dto) {
        dto.setOrderId(id);
        processingOrderService.finishTanning(id, dto);
        return Result.success();
    }

    @PutMapping("/{id}/drying/start")
    @RequiresRole({RoleEnum.ADMIN, RoleEnum.TANNER})
    public Result<Void> startDrying(@PathVariable @NotNull(message = "工单ID不能为空") Long id) {
        processingOrderService.startDrying(id);
        return Result.success();
    }

    @PutMapping("/{id}/drying/finish")
    @RequiresRole({RoleEnum.ADMIN, RoleEnum.TANNER})
    public Result<Void> finishDrying(@PathVariable @NotNull(message = "工单ID不能为空") Long id) {
        processingOrderService.finishDrying(id);
        return Result.success();
    }

    @PutMapping("/{id}/coloring/start")
    @RequiresRole({RoleEnum.ADMIN, RoleEnum.TANNER})
    public Result<Void> startColoring(@PathVariable @NotNull(message = "工单ID不能为空") Long id) {
        processingOrderService.startColoring(id);
        return Result.success();
    }

    @PutMapping("/{id}/coloring/finish")
    @RequiresRole({RoleEnum.ADMIN, RoleEnum.TANNER})
    public Result<Void> finishColoring(@PathVariable @NotNull(message = "工单ID不能为空") Long id,
                                        @RequestBody @Valid OrderProcessDTO dto) {
        dto.setOrderId(id);
        processingOrderService.finishColoring(id, dto);
        return Result.success();
    }

    @PutMapping("/{id}/cutting/start")
    @RequiresRole({RoleEnum.ADMIN, RoleEnum.CUTTER})
    public Result<Void> startCutting(@PathVariable @NotNull(message = "工单ID不能为空") Long id) {
        processingOrderService.startCutting(id);
        return Result.success();
    }

    @PutMapping("/{id}/cutting/finish")
    @RequiresRole({RoleEnum.ADMIN, RoleEnum.CUTTER})
    public Result<Void> finishCutting(@PathVariable @NotNull(message = "工单ID不能为空") Long id,
                                      @RequestBody @Valid OrderProcessDTO dto) {
        dto.setOrderId(id);
        processingOrderService.finishCutting(id, dto);
        return Result.success();
    }

    @PutMapping("/{id}/qc/start")
    @RequiresRole({RoleEnum.ADMIN})
    public Result<Void> startQc(@PathVariable @NotNull(message = "工单ID不能为空") Long id) {
        processingOrderService.startQc(id);
        return Result.success();
    }

    @PutMapping("/{id}/qc/finish")
    @RequiresRole({RoleEnum.ADMIN})
    public Result<Void> finishQc(@PathVariable @NotNull(message = "工单ID不能为空") Long id,
                                 @RequestBody @Valid OrderCompleteDTO dto) {
        dto.setOrderId(id);
        processingOrderService.finishQc(dto);
        return Result.success();
    }

    @PutMapping("/{id}/cancel")
    @RequiresRole({RoleEnum.ADMIN})
    public Result<Void> cancelOrder(@PathVariable @NotNull(message = "工单ID不能为空") Long id) {
        processingOrderService.cancelOrder(id);
        return Result.success();
    }

    @GetMapping("/{id}/materials")
    @RequiresRole({RoleEnum.ADMIN, RoleEnum.TANNER, RoleEnum.CUTTER})
    public Result<List<OrderMaterialVO>> getOrderMaterials(@PathVariable @NotNull(message = "工单ID不能为空") Long id) {
        return Result.success(processingOrderService.getOrderMaterials(id));
    }

    @GetMapping("/{id}/material-cost")
    @RequiresRole({RoleEnum.ADMIN, RoleEnum.TANNER, RoleEnum.CUTTER})
    public Result<Map<String, BigDecimal>> getMaterialCost(@PathVariable @NotNull(message = "工单ID不能为空") Long id) {
        return Result.success(processingOrderService.getMaterialCost(id));
    }

    @GetMapping
    @RequiresRole({RoleEnum.ADMIN, RoleEnum.TANNER, RoleEnum.CUTTER, RoleEnum.PURCHASER})
    public Result<List<ProcessingOrderVO>> list(ProcessingOrderQueryDTO query) {
        return Result.success(processingOrderService.list(query));
    }

    @GetMapping("/{id}")
    @RequiresRole({RoleEnum.ADMIN, RoleEnum.TANNER, RoleEnum.CUTTER, RoleEnum.PURCHASER})
    public Result<ProcessingOrderVO> getById(@PathVariable @NotNull(message = "工单ID不能为空") Long id) {
        return Result.success(processingOrderService.getById(id));
    }
}
