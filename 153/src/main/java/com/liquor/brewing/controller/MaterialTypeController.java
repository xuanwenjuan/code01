package com.liquor.brewing.controller;

import com.liquor.brewing.common.Result;
import com.liquor.brewing.entity.MaterialType;
import com.liquor.brewing.service.MaterialTypeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.annotation.Resource;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "物料类型管理", description = "物料类型管理接口")
@RestController
@RequestMapping("/material/type")
public class MaterialTypeController {

    @Resource
    private MaterialTypeService materialTypeService;

    @Operation(summary = "获取所有物料类型")
    @GetMapping("/list")
    public Result<List<MaterialType>> list() {
        return Result.success(materialTypeService.listAll());
    }

    @Operation(summary = "获取物料类型详情")
    @GetMapping("/{id}")
    public Result<MaterialType> getById(@PathVariable Long id) {
        return Result.success(materialTypeService.getById(id));
    }

    @Operation(summary = "新增物料类型")
    @PostMapping
    public Result<Void> add(@RequestBody MaterialType materialType) {
        materialTypeService.add(materialType);
        return Result.success();
    }

    @Operation(summary = "修改物料类型")
    @PutMapping
    public Result<Void> update(@RequestBody MaterialType materialType) {
        materialTypeService.update(materialType);
        return Result.success();
    }

    @Operation(summary = "删除物料类型")
    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        materialTypeService.delete(id);
        return Result.success();
    }
}
