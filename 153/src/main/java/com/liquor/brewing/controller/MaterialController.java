package com.liquor.brewing.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.liquor.brewing.annotation.Log;
import com.liquor.brewing.annotation.RequiresRole;
import com.liquor.brewing.common.Constants;
import com.liquor.brewing.common.PageQuery;
import com.liquor.brewing.common.PageResult;
import com.liquor.brewing.common.Result;
import com.liquor.brewing.dto.MaterialQueryDTO;
import com.liquor.brewing.entity.Material;
import com.liquor.brewing.entity.MaterialBatch;
import com.liquor.brewing.service.MaterialService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.annotation.Resource;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@Tag(name = "物料管理", description = "酿造物料库存管理接口")
@RestController
@RequestMapping("/material")
public class MaterialController {

    @Resource
    private MaterialService materialService;

    @Operation(summary = "分页查询物料列表")
    @GetMapping("/page")
    public Result<PageResult<Material>> page(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long typeId,
            @RequestParam(required = false) Integer status,
            PageQuery pageQuery) {
        IPage<Material> page = materialService.page(keyword, typeId, status, pageQuery);
        return Result.success(PageResult.of(page));
    }

    @Operation(summary = "多条件查询物料列表")
    @PostMapping("/query")
    public Result<PageResult<Material>> query(@RequestBody MaterialQueryDTO query, PageQuery pageQuery) {
        IPage<Material> page = materialService.pageByCondition(query, pageQuery);
        return Result.success(PageResult.of(page));
    }

    @Operation(summary = "获取物料详情")
    @GetMapping("/{id}")
    public Result<Material> getById(@PathVariable Long id) {
        return Result.success(materialService.getById(id));
    }

    @Operation(summary = "新增物料")
    @PostMapping
    @RequiresRole(value = {Constants.RoleCode.PURCHASER, Constants.RoleCode.SUPERVISOR}, message = "只有采购统筹或车间主管可以新增物料")
    @Log(module = "物料管理", operationType = Constants.OperationType.CREATE, description = "新增物料")
    public Result<Void> add(@RequestBody Material material) {
        materialService.add(material);
        return Result.success();
    }

    @Operation(summary = "修改物料")
    @PutMapping
    @RequiresRole(value = {Constants.RoleCode.PURCHASER, Constants.RoleCode.SUPERVISOR}, message = "只有采购统筹或车间主管可以修改物料")
    @Log(module = "物料管理", operationType = Constants.OperationType.UPDATE, description = "修改物料")
    public Result<Void> update(@RequestBody Material material) {
        materialService.update(material);
        return Result.success();
    }

    @Operation(summary = "删除物料")
    @DeleteMapping("/{id}")
    @RequiresRole(value = {Constants.RoleCode.SUPERVISOR}, message = "只有车间主管可以删除物料")
    @Log(module = "物料管理", operationType = Constants.OperationType.DELETE, description = "删除物料")
    public Result<Void> delete(@PathVariable Long id) {
        materialService.delete(id);
        return Result.success();
    }

    @Operation(summary = "批量删除物料")
    @DeleteMapping("/batch")
    @RequiresRole(value = {Constants.RoleCode.SUPERVISOR}, message = "只有车间主管可以批量删除物料")
    @Log(module = "物料管理", operationType = Constants.OperationType.DELETE, description = "批量删除物料")
    public Result<Void> batchDelete(@RequestBody List<Long> ids) {
        materialService.batchDelete(ids);
        return Result.success();
    }

    @Operation(summary = "修改物料状态")
    @PutMapping("/{id}/status")
    @RequiresRole(value = {Constants.RoleCode.PURCHASER, Constants.RoleCode.SUPERVISOR}, message = "只有采购统筹或车间主管可以修改物料状态")
    @Log(module = "物料管理", operationType = Constants.OperationType.STATUS_CHANGE, description = "修改物料状态")
    public Result<Void> updateStatus(@PathVariable Long id, @RequestParam Integer status) {
        materialService.updateStatus(id, status);
        return Result.success();
    }

    @Operation(summary = "批量修改物料状态")
    @PutMapping("/batch/status")
    @RequiresRole(value = {Constants.RoleCode.PURCHASER, Constants.RoleCode.SUPERVISOR}, message = "只有采购统筹或车间主管可以批量修改物料状态")
    @Log(module = "物料管理", operationType = Constants.OperationType.STATUS_CHANGE, description = "批量修改物料状态")
    public Result<Void> batchUpdateStatus(@RequestBody List<Long> ids, @RequestParam Integer status) {
        materialService.batchUpdateStatus(ids, status);
        return Result.success();
    }

    @Operation(summary = "物料入库")
    @PostMapping("/stock-in")
    @RequiresRole(value = {Constants.RoleCode.PURCHASER, Constants.RoleCode.SUPERVISOR}, message = "只有采购统筹或车间主管可以执行物料入库")
    @Log(module = "物料管理", operationType = Constants.OperationType.STATUS_CHANGE, description = "物料入库")
    public Result<Void> stockIn(@RequestBody MaterialBatch batch) {
        materialService.stockIn(batch);
        return Result.success();
    }

    @Operation(summary = "物料出库")
    @PostMapping("/stock-out")
    @RequiresRole(value = {Constants.RoleCode.PURCHASER, Constants.RoleCode.BREWER, Constants.RoleCode.SUPERVISOR}, message = "只有采购统筹、酿造技术员或车间主管可以执行物料出库")
    @Log(module = "物料管理", operationType = Constants.OperationType.STATUS_CHANGE, description = "物料出库")
    public Result<Void> stockOut(
            @RequestParam Long batchId,
            @RequestParam BigDecimal quantity,
            @RequestParam(required = false) Long workOrderId,
            @RequestParam(required = false) String remark) {
        materialService.stockOut(batchId, quantity, workOrderId, remark);
        return Result.success();
    }

    @Operation(summary = "获取到期预警物料")
    @GetMapping("/expire-warning")
    public Result<List<MaterialBatch>> getExpireWarning() {
        return Result.success(materialService.getExpireWarning());
    }
}
