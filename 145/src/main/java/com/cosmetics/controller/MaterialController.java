package com.cosmetics.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.cosmetics.annotation.RequireRole;
import com.cosmetics.common.PageQuery;
import com.cosmetics.common.Result;
import com.cosmetics.dto.MaterialQueryDTO;
import com.cosmetics.entity.Material;
import com.cosmetics.enums.UserRoleEnum;
import com.cosmetics.service.MaterialService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Tag(name = "原料管理")
@RestController
@RequestMapping("/materials")
@RequiredArgsConstructor
public class MaterialController {

    private final MaterialService materialService;

    @Operation(summary = "分页查询原料列表")
    @GetMapping("/page")
    public Result<Page<Material>> getPage(
            @ModelAttribute PageQuery pageQuery,
            @RequestParam(required = false) Integer type,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Integer status) {
        return Result.success(materialService.getPage(pageQuery, type, keyword, status));
    }

    @Operation(summary = "多条件组合查询原料列表")
    @PostMapping("/query")
    public Result<Page<Material>> getPageByConditions(
            @ModelAttribute PageQuery pageQuery,
            @RequestBody MaterialQueryDTO queryDTO) {
        return Result.success(materialService.getPageByConditions(pageQuery, queryDTO));
    }

    @Operation(summary = "获取原料统计信息")
    @GetMapping("/statistics")
    @RequireRole({UserRoleEnum.MATERIAL_PURCHASER, UserRoleEnum.WAREHOUSE_ADMIN, UserRoleEnum.PRODUCTION_LEADER})
    public Result<List<Map<String, Object>>> getMaterialStatistics() {
        return Result.success(materialService.getMaterialStatistics());
    }

    @Operation(summary = "获取原料详情")
    @GetMapping("/{id}")
    public Result<Material> getById(@PathVariable Long id) {
        return Result.success(materialService.getById(id));
    }

    @Operation(summary = "新增原料")
    @PostMapping
    @RequireRole({UserRoleEnum.MATERIAL_PURCHASER, UserRoleEnum.WAREHOUSE_ADMIN})
    public Result<Void> add(@Valid @RequestBody Material material) {
        materialService.add(material);
        return Result.success();
    }

    @Operation(summary = "更新原料")
    @PutMapping
    @RequireRole({UserRoleEnum.MATERIAL_PURCHASER, UserRoleEnum.WAREHOUSE_ADMIN})
    public Result<Void> update(@Valid @RequestBody Material material) {
        materialService.update(material);
        return Result.success();
    }

    @Operation(summary = "删除原料")
    @DeleteMapping("/{id}")
    @RequireRole({UserRoleEnum.MATERIAL_PURCHASER, UserRoleEnum.WAREHOUSE_ADMIN})
    public Result<Void> delete(@PathVariable Long id) {
        materialService.delete(id);
        return Result.success();
    }

    @Operation(summary = "更新原料状态")
    @PutMapping("/{id}/status")
    @RequireRole({UserRoleEnum.MATERIAL_PURCHASER, UserRoleEnum.WAREHOUSE_ADMIN})
    public Result<Void> updateStatus(@PathVariable Long id, @RequestParam Integer status) {
        materialService.updateStatus(id, status);
        return Result.success();
    }
}
