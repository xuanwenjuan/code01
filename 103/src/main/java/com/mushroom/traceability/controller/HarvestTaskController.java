package com.mushroom.traceability.controller;

import com.mushroom.traceability.annotation.RequiresRole;
import com.mushroom.traceability.common.Constants;
import com.mushroom.traceability.common.Result;
import com.mushroom.traceability.dto.*;
import com.mushroom.traceability.entity.HarvestDetail;
import com.mushroom.traceability.entity.HarvestTask;
import com.mushroom.traceability.service.HarvestDetailService;
import com.mushroom.traceability.service.HarvestTaskService;
import com.mushroom.traceability.vo.HarvestCostVO;
import com.mushroom.traceability.vo.PageResult;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class HarvestTaskController {

    private final HarvestTaskService taskService;
    private final HarvestDetailService detailService;

    @PostMapping("/query")
    public Result<PageResult<HarvestTask>> queryPage(@RequestBody HarvestTaskQueryDTO query) {
        return Result.success(taskService.queryPage(query));
    }

    @GetMapping
    public Result<List<HarvestTask>> list(@RequestParam(required = false) Long harvesterId) {
        return Result.success(taskService.listByHarvester(harvesterId));
    }

    @GetMapping("/status/{status}")
    public Result<List<HarvestTask>> listByStatus(@PathVariable String status) {
        return Result.success(taskService.listByStatus(status));
    }

    @GetMapping("/{id}")
    public Result<HarvestTask> getById(@PathVariable Long id) {
        return Result.success(taskService.getById(id));
    }

    @GetMapping("/{id}/details")
    public Result<List<HarvestDetail>> getDetailsByTaskId(@PathVariable Long id) {
        return Result.success(detailService.listByTaskId(id));
    }

    @PostMapping
    @RequiresRole({Constants.ROLE_OPERATOR, Constants.ROLE_ADMIN})
    public Result<Long> create(@Valid @RequestBody HarvestTaskCreateDTO dto) {
        return Result.success(taskService.createTask(dto));
    }

    @PutMapping("/assign")
    @RequiresRole({Constants.ROLE_OPERATOR, Constants.ROLE_ADMIN})
    public Result<Void> assignTask(@Valid @RequestBody TaskAssignDTO dto) {
        taskService.assignTask(dto);
        return Result.success();
    }

    @PutMapping("/{id}/start")
    @RequiresRole({Constants.ROLE_HARVESTER, Constants.ROLE_ADMIN})
    public Result<Void> startCollecting(@PathVariable Long id) {
        taskService.startCollecting(id);
        return Result.success();
    }

    @PutMapping("/{id}/submit-quality")
    @RequiresRole({Constants.ROLE_HARVESTER, Constants.ROLE_ADMIN})
    public Result<Void> submitQualityCheck(@PathVariable Long id) {
        taskService.submitQualityCheck(id);
        return Result.success();
    }

    @PostMapping("/warehouse-in")
    @RequiresRole({Constants.ROLE_WAREHOUSE, Constants.ROLE_ADMIN})
    public Result<HarvestCostVO> warehouseIn(@Valid @RequestBody WarehouseInDTO dto) {
        return Result.success(taskService.warehouseIn(dto));
    }

    @PutMapping("/{id}/ship")
    @RequiresRole({Constants.ROLE_WAREHOUSE, Constants.ROLE_ADMIN})
    public Result<Void> shipTask(@PathVariable Long id) {
        taskService.shipTask(id);
        return Result.success();
    }

    @PutMapping("/{id}/cancel")
    @RequiresRole({Constants.ROLE_OPERATOR, Constants.ROLE_ADMIN})
    public Result<Void> cancelTask(@PathVariable Long id) {
        taskService.cancelTask(id);
        return Result.success();
    }

    @PostMapping("/details")
    @RequiresRole({Constants.ROLE_HARVESTER, Constants.ROLE_ADMIN})
    public Result<Void> addDetail(@Valid @RequestBody HarvestDetailDTO detail) {
        return Result.success();
    }
}