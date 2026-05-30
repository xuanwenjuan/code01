package com.fitness.manufacture.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.fitness.manufacture.common.PageQuery;
import com.fitness.manufacture.common.Result;
import com.fitness.manufacture.dto.MaterialOutboundDTO;
import com.fitness.manufacture.dto.MaterialOutboundQueryDTO;
import com.fitness.manufacture.entity.MaterialOutbound;
import com.fitness.manufacture.service.MaterialOutboundService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@Tag(name = "物料出库管理")
@RestController
@RequestMapping("/api/material-outbounds")
@RequiredArgsConstructor
public class MaterialOutboundController {

    private final MaterialOutboundService materialOutboundService;

    @Operation(summary = "创建出库单")
    @PostMapping
    public Result<Void> saveOutbound(@Valid @RequestBody MaterialOutboundDTO dto) {
        materialOutboundService.saveOutbound(dto);
        return Result.success();
    }

    @Operation(summary = "审核出库单")
    @PutMapping("/{id}/audit")
    public Result<Void> auditOutbound(@PathVariable Long id,
                                      @RequestParam Integer status,
                                      @RequestParam(required = false) String remark) {
        materialOutboundService.auditOutbound(id, status, remark);
        return Result.success();
    }

    @Operation(summary = "获取出库单分页列表")
    @GetMapping("/page")
    public Result<IPage<MaterialOutbound>> getOutboundPage(PageQuery query,
                                                          @RequestParam(required = false) Long materialId,
                                                          @RequestParam(required = false) Long workOrderId,
                                                          @RequestParam(required = false) Integer status) {
        return Result.success(materialOutboundService.getOutboundPage(query, materialId, workOrderId, status));
    }

    @Operation(summary = "获取出库单详情")
    @GetMapping("/{id}")
    public Result<MaterialOutbound> getOutboundById(@PathVariable Long id) {
        return Result.success(materialOutboundService.getById(id));
    }

    @Operation(summary = "多条件组合分页查询出库单")
    @PostMapping("/search")
    public Result<IPage<MaterialOutbound>> searchOutbounds(@RequestBody MaterialOutboundQueryDTO queryDTO) {
        return Result.success(materialOutboundService.getOutboundPageByConditions(queryDTO));
    }
}
