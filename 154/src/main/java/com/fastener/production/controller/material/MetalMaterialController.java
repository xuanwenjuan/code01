package com.fastener.production.controller.material;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.fastener.production.common.annotation.RequiresPermission;
import com.fastener.production.common.entity.PageQuery;
import com.fastener.production.common.result.Result;
import com.fastener.production.entity.material.MetalMaterial;
import com.fastener.production.entity.material.dto.MetalMaterialDTO;
import com.fastener.production.entity.material.dto.MetalMaterialQueryDTO;
import com.fastener.production.service.material.MetalMaterialService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "金属原料管理", description = "金属原料基础信息管理接口")
@RestController
@RequestMapping("/material/metal")
@RequiredArgsConstructor
public class MetalMaterialController {

    private final MetalMaterialService metalMaterialService;

    @Operation(summary = "多条件组合查询原料（分页）")
    @PostMapping("/query")
    public Result<IPage<MetalMaterial>> queryByConditions(PageQuery pageQuery,
                                                           @RequestBody(required = false) MetalMaterialQueryDTO queryDTO) {
        return Result.success(metalMaterialService.queryByConditions(pageQuery, queryDTO));
    }

    @Operation(summary = "多条件组合查询原料（列表）")
    @PostMapping("/list")
    public Result<List<MetalMaterial>> listByConditions(@RequestBody(required = false) MetalMaterialQueryDTO queryDTO) {
        return Result.success(metalMaterialService.listByConditions(queryDTO));
    }

    @Operation(summary = "分页查询原料列表")
    @GetMapping("/page")
    public Result<IPage<MetalMaterial>> page(PageQuery pageQuery,
                                             @RequestParam(required = false) String materialName,
                                             @RequestParam(required = false) Integer materialType,
                                             @RequestParam(required = false) Integer status) {
        return Result.success(metalMaterialService.page(pageQuery, materialName, materialType, status));
    }

    @Operation(summary = "获取所有材质牌号")
    @GetMapping("/grades")
    public Result<List<String>> listAllGrades() {
        return Result.success(metalMaterialService.listAllGrades());
    }

    @Operation(summary = "获取所有供应商")
    @GetMapping("/suppliers")
    public Result<List<String>> listAllSuppliers() {
        return Result.success(metalMaterialService.listAllSuppliers());
    }

    @Operation(summary = "获取所有产地")
    @GetMapping("/origins")
    public Result<List<String>> listAllOrigins() {
        return Result.success(metalMaterialService.listAllOrigins());
    }

    @Operation(summary = "根据类型查询原料列表")
    @GetMapping("/type/{materialType}")
    public Result<List<MetalMaterial>> listByType(@PathVariable Integer materialType) {
        return Result.success(metalMaterialService.listByType(materialType));
    }

    @Operation(summary = "获取原料详情")
    @GetMapping("/{id}")
    public Result<MetalMaterial> getById(@PathVariable Long id) {
        return Result.success(metalMaterialService.getById(id));
    }

    @Operation(summary = "新增原料")
    @PostMapping
    @RequiresPermission("material:manage")
    public Result<Void> add(@Valid @RequestBody MetalMaterialDTO dto) {
        metalMaterialService.add(dto);
        return Result.success();
    }

    @Operation(summary = "修改原料")
    @PutMapping
    @RequiresPermission("material:manage")
    public Result<Void> update(@Valid @RequestBody MetalMaterialDTO dto) {
        metalMaterialService.update(dto);
        return Result.success();
    }

    @Operation(summary = "删除原料")
    @DeleteMapping("/{id}")
    @RequiresPermission("material:manage")
    public Result<Void> delete(@PathVariable Long id) {
        metalMaterialService.delete(id);
        return Result.success();
    }
}
