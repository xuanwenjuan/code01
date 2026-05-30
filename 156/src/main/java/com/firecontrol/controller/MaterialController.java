package com.firecontrol.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.firecontrol.annotation.OperationLog;
import com.firecontrol.annotation.RequireRole;
import com.firecontrol.common.PageQuery;
import com.firecontrol.common.Result;
import com.firecontrol.common.constant.UserConstants;
import com.firecontrol.dto.MaterialDTO;
import com.firecontrol.dto.MaterialStockInDTO;
import com.firecontrol.entity.Material;
import com.firecontrol.entity.MaterialBatch;
import com.firecontrol.entity.MaterialStockRecord;
import com.firecontrol.service.MaterialService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.annotation.Resource;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "主材仓储管理", description = "消防主材仓储管理接口")
@RestController
@RequestMapping("/material")
@RequireRole(anyRole = {UserConstants.ROLE_PURCHASE, UserConstants.ROLE_ADMIN, UserConstants.ROLE_QUALITY})
public class MaterialController {

    @Resource
    private MaterialService materialService;

    @Operation(summary = "新增物资")
    @OperationLog(module = "主材仓储", operation = "新增物资", description = "新增消防主材信息")
    @PostMapping
    public Result<Void> addMaterial(@Valid @RequestBody MaterialDTO dto) {
        materialService.addMaterial(dto);
        return Result.success();
    }

    @Operation(summary = "修改物资")
    @OperationLog(module = "主材仓储", operation = "修改物资", description = "修改消防主材信息")
    @PutMapping
    public Result<Void> updateMaterial(@Valid @RequestBody MaterialDTO dto) {
        materialService.updateMaterial(dto);
        return Result.success();
    }

    @Operation(summary = "删除物资")
    @OperationLog(module = "主材仓储", operation = "删除物资", description = "删除消防主材信息")
    @DeleteMapping("/{id}")
    public Result<Void> deleteMaterial(@PathVariable Long id) {
        materialService.deleteMaterial(id);
        return Result.success();
    }

    @Operation(summary = "根据ID获取物资详情")
    @GetMapping("/{id}")
    public Result<Material> getMaterialById(@PathVariable Long id) {
        return Result.success(materialService.getMaterialById(id));
    }

    @Operation(summary = "分页查询物资列表")
    @PostMapping("/page")
    public Result<IPage<Material>> getMaterialPage(@RequestBody MaterialDTO dto, PageQuery pageQuery) {
        return Result.success(materialService.getMaterialPage(dto, pageQuery));
    }

    @Operation(summary = "获取库存预警列表")
    @GetMapping("/warning")
    public Result<List<Material>> getWarningStockList() {
        return Result.success(materialService.getWarningStockList());
    }

    @Operation(summary = "获取即将复检物资列表")
    @GetMapping("/recheck-soon")
    public Result<List<Material>> getRecheckSoonList() {
        return Result.success(materialService.getRecheckSoonList());
    }

    @Operation(summary = "物资入库")
    @OperationLog(module = "主材仓储", operation = "物资入库", description = "消防主材入库登记")
    @PostMapping("/stock-in")
    public Result<Void> stockIn(@Valid @RequestBody MaterialStockInDTO dto) {
        materialService.stockIn(dto);
        return Result.success();
    }

    @Operation(summary = "生成批次码")
    @GetMapping("/batch-code/{materialCode}")
    public Result<String> generateBatchCode(@PathVariable String materialCode) {
        return Result.success(materialService.generateBatchCode(materialCode));
    }

    @Operation(summary = "更新复检状态")
    @OperationLog(module = "主材仓储", operation = "更新复检状态", description = "更新承压金属原料复检状态")
    @PutMapping("/batch/{batchId}/recheck/{status}")
    public Result<Void> updateRecheckStatus(@PathVariable Long batchId, @PathVariable Integer status, @RequestParam(required = false) String remark) {
        materialService.updateRecheckStatus(batchId, status, remark);
        return Result.success();
    }

    @Operation(summary = "获取物资批次列表")
    @GetMapping("/{materialId}/batches")
    public Result<List<MaterialBatch>> getMaterialBatches(@PathVariable Long materialId) {
        return Result.success(materialService.getMaterialBatches(materialId));
    }

    @Operation(summary = "获取库存变动记录")
    @GetMapping("/stock-records")
    public Result<IPage<MaterialStockRecord>> getStockRecordPage(
            @RequestParam(required = false) Long materialId,
            @RequestParam(required = false) Integer recordType,
            PageQuery pageQuery) {
        return Result.success(materialService.getStockRecordPage(materialId, recordType, pageQuery));
    }

    @Operation(summary = "搜索物资")
    @GetMapping("/search")
    public Result<List<Material>> searchMaterials(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String materialType,
            @RequestParam(required = false) Integer stockStatus) {
        return Result.success(materialService.searchMaterials(keyword, materialType, stockStatus));
    }
}
