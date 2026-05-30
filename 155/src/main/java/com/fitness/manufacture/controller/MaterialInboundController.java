package com.fitness.manufacture.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.fitness.manufacture.annotation.RequiresRoles;
import com.fitness.manufacture.common.PageQuery;
import com.fitness.manufacture.common.Result;
import com.fitness.manufacture.dto.MaterialInboundDTO;
import com.fitness.manufacture.dto.MaterialInboundQueryDTO;
import com.fitness.manufacture.entity.MaterialInbound;
import com.fitness.manufacture.service.MaterialInboundService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@Tag(name = "物料入库管理")
@RestController
@RequestMapping("/api/material-inbounds")
@RequiredArgsConstructor
public class MaterialInboundController {

    private final MaterialInboundService materialInboundService;

    @Operation(summary = "创建入库单")
    @PostMapping
    @RequiresRoles(postCodes = {"PURCHASE", "ADMIN"})
    public Result<Void> saveInbound(@Valid @RequestBody MaterialInboundDTO dto) {
        materialInboundService.saveInbound(dto);
        return Result.success();
    }

    @Operation(summary = "审核入库单")
    @PutMapping("/{id}/audit")
    @RequiresRoles(postCodes = {"PURCHASE", "PROCESS", "ADMIN"})
    public Result<Void> auditInbound(@PathVariable Long id,
                                     @RequestParam Integer status,
                                     @RequestParam(required = false) String remark) {
        materialInboundService.auditInbound(id, status, remark);
        return Result.success();
    }

    @Operation(summary = "获取入库单分页列表")
    @GetMapping("/page")
    public Result<IPage<MaterialInbound>> getInboundPage(PageQuery query,
                                                         @RequestParam(required = false) Long materialId,
                                                         @RequestParam(required = false) Integer status) {
        return Result.success(materialInboundService.getInboundPage(query, materialId, status));
    }

    @Operation(summary = "获取入库单详情")
    @GetMapping("/{id}")
    public Result<MaterialInbound> getInboundById(@PathVariable Long id) {
        return Result.success(materialInboundService.getById(id));
    }

    @Operation(summary = "多条件组合分页查询入库单")
    @PostMapping("/search")
    public Result<IPage<MaterialInbound>> searchInbounds(@RequestBody MaterialInboundQueryDTO queryDTO) {
        return Result.success(materialInboundService.getInboundPageByConditions(queryDTO));
    }
}
