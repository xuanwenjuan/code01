package com.household.management.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.household.management.common.annotation.OperationLog;
import com.household.management.common.entity.PageQuery;
import com.household.management.common.result.Result;
import com.household.management.entity.RawMaterial;
import com.household.management.entity.RawMaterialStock;
import com.household.management.service.RawMaterialService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "原材料管理")
@RestController
@RequestMapping("/raw-material")
public class RawMaterialController {

    private final RawMaterialService materialService;

    public RawMaterialController(RawMaterialService materialService) {
        this.materialService = materialService;
    }

    @GetMapping("/page")
    @Operation(summary = "多条件分页查询原材料")
    public Result<IPage<RawMaterial>> page(PageQuery pageQuery,
                                            @RequestParam(required = false) String materialType,
                                            @RequestParam(required = false) String materialTexture,
                                            @RequestParam(required = false) Integer status,
                                            @RequestParam(required = false) String keyword) {
        return Result.success(materialService.page(pageQuery, materialType, materialTexture, status, keyword));
    }

    @GetMapping("/list")
    @Operation(summary = "获取原材料列表")
    public Result<List<RawMaterial>> list() {
        return Result.success(materialService.list());
    }

    @GetMapping("/{id}")
    @Operation(summary = "获取原材料详情")
    public Result<RawMaterial> getById(@PathVariable Long id) {
        return Result.success(materialService.getById(id));
    }

    @PostMapping
    @Operation(summary = "新增原材料")
    @OperationLog(module = "原材料管理", operation = "新增原材料")
    public Result<Void> add(@Valid @RequestBody RawMaterial material) {
        materialService.add(material);
        return Result.success();
    }

    @PutMapping
    @Operation(summary = "更新原材料")
    @OperationLog(module = "原材料管理", operation = "更新原材料")
    public Result<Void> update(@Valid @RequestBody RawMaterial material) {
        materialService.update(material);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "删除原材料")
    @OperationLog(module = "原材料管理", operation = "删除原材料")
    public Result<Void> delete(@PathVariable Long id) {
        materialService.delete(id);
        return Result.success();
    }

    @PutMapping("/{id}/status")
    @Operation(summary = "更新原材料状态")
    @OperationLog(module = "原材料管理", operation = "更新原材料状态")
    public Result<Void> updateStatus(@PathVariable Long id, @RequestParam Integer status) {
        materialService.updateStatus(id, status);
        return Result.success();
    }

    @GetMapping("/stock/list")
    @Operation(summary = "获取原料库存列表")
    public Result<List<RawMaterialStock>> getStockList() {
        return Result.success(materialService.getStockList());
    }

    @GetMapping("/stock/moisture-warning")
    @Operation(summary = "获取易潮原料到期提醒列表")
    public Result<List<RawMaterialStock>> getMoistureWarningList() {
        return Result.success(materialService.getMoistureWarningList());
    }

    @PostMapping("/stock/in")
    @Operation(summary = "原料入库")
    @OperationLog(module = "原材料管理", operation = "原料入库")
    public Result<Void> stockIn(@Valid @RequestBody RawMaterialStock stock) {
        materialService.stockIn(stock);
        return Result.success();
    }
}
