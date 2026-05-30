package com.fitness.manufacture.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.fitness.manufacture.common.Result;
import com.fitness.manufacture.dto.MaterialBatchQueryDTO;
import com.fitness.manufacture.entity.MaterialBatch;
import com.fitness.manufacture.service.MaterialBatchService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@Tag(name = "物料批次管理")
@RestController
@RequestMapping("/api/material-batches")
@RequiredArgsConstructor
public class MaterialBatchController {

    private final MaterialBatchService materialBatchService;

    @Operation(summary = "获取批次详情")
    @GetMapping("/{id}")
    public Result<MaterialBatch> getBatchById(@PathVariable Long id) {
        return Result.success(materialBatchService.getById(id));
    }

    @Operation(summary = "多条件组合分页查询批次")
    @PostMapping("/search")
    public Result<IPage<MaterialBatch>> searchBatches(@RequestBody MaterialBatchQueryDTO queryDTO) {
        return Result.success(materialBatchService.getBatchPageByConditions(queryDTO));
    }

    @Operation(summary = "获取物料可用批次列表")
    @GetMapping("/material/{materialId}/available")
    public Result<java.util.List<MaterialBatch>> getAvailableBatches(@PathVariable Long materialId) {
        return Result.success(materialBatchService.getAvailableBatches(materialId));
    }
}
