package com.fitness.manufacture.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.fitness.manufacture.common.PageQuery;
import com.fitness.manufacture.common.Result;
import com.fitness.manufacture.dto.MaterialDTO;
import com.fitness.manufacture.dto.MaterialQueryDTO;
import com.fitness.manufacture.entity.Material;
import com.fitness.manufacture.entity.MaterialBatch;
import com.fitness.manufacture.service.MaterialBatchService;
import com.fitness.manufacture.service.MaterialService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "物料管理")
@RestController
@RequestMapping("/api/materials")
@RequiredArgsConstructor
public class MaterialController {

    private final MaterialService materialService;
    private final MaterialBatchService materialBatchService;

    @Operation(summary = "新增物料")
    @PostMapping
    public Result<Void> saveMaterial(@Valid @RequestBody MaterialDTO dto) {
        materialService.saveMaterial(dto);
        return Result.success();
    }

    @Operation(summary = "修改物料")
    @PutMapping
    public Result<Void> updateMaterial(@Valid @RequestBody MaterialDTO dto) {
        materialService.updateMaterial(dto);
        return Result.success();
    }

    @Operation(summary = "删除物料")
    @DeleteMapping("/{id}")
    public Result<Void> deleteMaterial(@PathVariable Long id) {
        materialService.deleteMaterial(id);
        return Result.success();
    }

    @Operation(summary = "获取物料分页列表")
    @GetMapping("/page")
    public Result<IPage<Material>> getMaterialPage(PageQuery query,
                                                   @RequestParam(required = false) String keyword,
                                                   @RequestParam(required = false) String materialType,
                                                   @RequestParam(required = false) Integer status) {
        return Result.success(materialService.getMaterialPage(query, keyword, materialType, status));
    }

    @Operation(summary = "获取物料详情")
    @GetMapping("/{id}")
    public Result<Material> getMaterialById(@PathVariable Long id) {
        return Result.success(materialService.getById(id));
    }

    @Operation(summary = "更新物料状态")
    @PutMapping("/{id}/status")
    public Result<Void> updateMaterialStatus(@PathVariable Long id, @RequestParam Integer status) {
        materialService.updateMaterialStatus(id, status);
        return Result.success();
    }

    @Operation(summary = "获取物料批次分页列表")
    @GetMapping("/batches/page")
    public Result<IPage<MaterialBatch>> getBatchPage(PageQuery query,
                                                     @RequestParam(required = false) Long materialId,
                                                     @RequestParam(required = false) Integer status) {
        return Result.success(materialBatchService.getBatchPage(query, materialId, status));
    }

    @Operation(summary = "获取物料可用批次列表")
    @GetMapping("/{materialId}/batches/available")
    public Result<List<MaterialBatch>> getAvailableBatches(@PathVariable Long materialId) {
        return Result.success(materialBatchService.getAvailableBatches(materialId));
    }

    @Operation(summary = "多条件组合分页查询物料")
    @PostMapping("/search")
    public Result<IPage<Material>> searchMaterials(@RequestBody MaterialQueryDTO queryDTO) {
        return Result.success(materialService.getMaterialPageByConditions(queryDTO));
    }
}
