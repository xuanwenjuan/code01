package com.fan.impeller.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.fan.impeller.annotation.RequiresRole;
import com.fan.impeller.common.Constants;
import com.fan.impeller.common.PageQuery;
import com.fan.impeller.common.Result;
import com.fan.impeller.dto.WorkOrderCreateDTO;
import com.fan.impeller.dto.WorkOrderQueryDTO;
import com.fan.impeller.entity.WorkOrder;
import com.fan.impeller.entity.WorkOrderMaterial;
import com.fan.impeller.service.WorkOrderService;
import jakarta.validation.Valid;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/work-order")
@RequiredArgsConstructor
public class WorkOrderController {

    private final WorkOrderService workOrderService;

    @GetMapping("/query")
    public Result<Page<WorkOrder>> query(PageQuery query, @Valid WorkOrderQueryDTO dto) {
        return Result.success(workOrderService.queryPage(query, dto));
    }

    @GetMapping("/page")
    public Result<Page<WorkOrder>> page(PageQuery query,
                                        @RequestParam(required = false) Integer status) {
        return Result.success(workOrderService.page(query, status));
    }

    @GetMapping("/{id}")
    public Result<WorkOrder> getById(@PathVariable Long id) {
        return Result.success(workOrderService.getDetailById(id));
    }

    @GetMapping("/{id}/materials")
    public Result<List<WorkOrderMaterial>> getMaterials(@PathVariable Long id) {
        return Result.success(workOrderService.getWorkOrderMaterials(id));
    }

    @PostMapping
    @RequiresRole({Constants.ROLE_PROCESS, Constants.ROLE_PRODUCTION})
    public Result<Void> create(@Valid @RequestBody WorkOrderCreateDTO dto) {
        workOrderService.createWorkOrder(dto);
        return Result.success();
    }

    @PutMapping("/start/{id}")
    @RequiresRole({Constants.ROLE_PRODUCTION})
    public Result<Void> startProduction(@PathVariable Long id) {
        workOrderService.startProduction(id);
        return Result.success();
    }

    @PutMapping("/next-step")
    @RequiresRole({Constants.ROLE_PRODUCTION})
    public Result<Void> nextStep(@RequestBody NextStepRequest request) {
        workOrderService.nextStep(request.getId(), request.getStep(), request.getRecords());
        return Result.success();
    }

    @DeleteMapping("/{id}")
    @RequiresRole({Constants.ROLE_ADMIN})
    public Result<Void> delete(@PathVariable Long id) {
        workOrderService.removeById(id);
        return Result.success();
    }

    @Data
    public static class NextStepRequest {
        private Long id;
        private Integer step;
        private String records;
    }
}
