package com.paper.production.controller.material;

import com.paper.production.annotation.OperateLog;
import com.paper.production.annotation.RequiresRoles;
import com.paper.production.common.PageQuery;
import com.paper.production.common.PageResult;
import com.paper.production.common.Result;
import com.paper.production.dto.material.MaterialDTO;
import com.paper.production.dto.material.MaterialInboundDTO;
import com.paper.production.dto.material.MaterialOutboundDTO;
import com.paper.production.dto.material.MaterialQueryDTO;
import com.paper.production.entity.material.Material;
import com.paper.production.entity.material.MaterialBatch;
import com.paper.production.entity.material.MaterialInbound;
import com.paper.production.entity.material.MaterialOutbound;
import com.paper.production.enums.RoleEnum;
import com.paper.production.service.material.MaterialService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.annotation.Resource;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Tag(name = "纸品原材仓储管理")
@RestController
@RequestMapping("/material")
public class MaterialController {

    @Resource
    private MaterialService materialService;

    @Operation(summary = "新增物料")
    @PostMapping
    @RequiresRoles({RoleEnum.PURCHASE, RoleEnum.ADMIN})
    @OperateLog(module = "原材仓储", operation = "新增物料", description = "新增物料信息")
    public Result<Void> save(@Valid @RequestBody MaterialDTO dto) {
        materialService.saveMaterial(dto);
        return Result.success();
    }

    @Operation(summary = "修改物料")
    @PutMapping
    @RequiresRoles({RoleEnum.PURCHASE, RoleEnum.ADMIN})
    @OperateLog(module = "原材仓储", operation = "修改物料", description = "修改物料信息")
    public Result<Void> update(@Valid @RequestBody MaterialDTO dto) {
        materialService.updateMaterial(dto);
        return Result.success();
    }

    @Operation(summary = "删除物料")
    @DeleteMapping("/{id}")
    @RequiresRoles({RoleEnum.PURCHASE, RoleEnum.ADMIN})
    @OperateLog(module = "原材仓储", operation = "删除物料", description = "删除物料信息")
    public Result<Void> delete(@PathVariable Long id) {
        materialService.deleteMaterial(id);
        return Result.success();
    }

    @Operation(summary = "分页查询物料")
    @PostMapping("/page")
    public Result<PageResult<Material>> page(@RequestBody PageQuery query) {
        return Result.success(materialService.queryMaterialPage(query));
    }

    @Operation(summary = "获取物料详情")
    @GetMapping("/{id}")
    public Result<Material> getById(@PathVariable Long id) {
        return Result.success(materialService.getById(id));
    }

    @Operation(summary = "获取物料列表")
    @GetMapping("/list")
    public Result<List<Material>> list() {
        return Result.success(materialService.list());
    }

    @Operation(summary = "按类型获取物料列表")
    @GetMapping("/type/{materialType}")
    public Result<List<Material>> listByType(@PathVariable String materialType) {
        return Result.success(materialService.listByType(materialType));
    }

    @Operation(summary = "物料入库")
    @PostMapping("/inbound")
    @RequiresRoles({RoleEnum.PURCHASE, RoleEnum.ADMIN})
    @OperateLog(module = "原材仓储", operation = "物料入库", description = "物料入库操作")
    public Result<Void> inbound(@Valid @RequestBody MaterialInboundDTO dto) {
        materialService.inbound(dto);
        return Result.success();
    }

    @Operation(summary = "物料出库")
    @PostMapping("/outbound")
    @RequiresRoles({RoleEnum.PURCHASE, RoleEnum.PRODUCTION, RoleEnum.ADMIN})
    @OperateLog(module = "原材仓储", operation = "物料出库", description = "物料出库操作")
    public Result<Void> outbound(@Valid @RequestBody MaterialOutboundDTO dto) {
        materialService.outbound(dto);
        return Result.success();
    }

    @Operation(summary = "获取物料批次列表")
    @GetMapping("/batch/{materialId}")
    public Result<List<MaterialBatch>> getBatches(@PathVariable Long materialId) {
        return Result.success(materialService.getMaterialBatches(materialId));
    }

    @Operation(summary = "获取所有批次列表")
    @GetMapping("/batch/list")
    public Result<List<MaterialBatch>> getBatchList() {
        return Result.success(materialService.getBatchList());
    }

    @Operation(summary = "分页查询批次")
    @PostMapping("/batch/page")
    public Result<PageResult<MaterialBatch>> queryBatchPage(@RequestBody PageQuery query) {
        return Result.success(materialService.queryBatchPage(query));
    }

    @Operation(summary = "分页查询入库记录")
    @PostMapping("/inbound/page")
    public Result<PageResult<MaterialInbound>> queryInboundPage(@RequestBody PageQuery query) {
        return Result.success(materialService.queryInboundPage(query));
    }

    @Operation(summary = "分页查询出库记录")
    @PostMapping("/outbound/page")
    public Result<PageResult<MaterialOutbound>> queryOutboundPage(@RequestBody PageQuery query) {
        return Result.success(materialService.queryOutboundPage(query));
    }

    @Operation(summary = "更新物料状态")
    @PutMapping("/status/{id}/{status}")
    @RequiresRoles({RoleEnum.PURCHASE, RoleEnum.ADMIN})
    @OperateLog(module = "原材仓储", operation = "更新物料状态", description = "更新物料状态")
    public Result<Void> updateStatus(@PathVariable Long id, @PathVariable Integer status) {
        materialService.updateStatus(id, status);
        return Result.success();
    }

    @Operation(summary = "检查库存预警")
    @PostMapping("/check-warning")
    @OperateLog(module = "原材仓储", operation = "检查库存预警", description = "检查库存预警状态")
    public Result<Void> checkStockWarning() {
        materialService.checkStockWarning();
        return Result.success();
    }

    @Operation(summary = "获取库存预警物料")
    @GetMapping("/warning/list")
    public Result<List<Material>> getWarningMaterials() {
        return Result.success(materialService.getWarningMaterials());
    }

    @Operation(summary = "获取即将到期的防潮材料")
    @GetMapping("/moisture/expiring")
    public Result<List<Material>> getMoistureProofExpiring() {
        return Result.success(materialService.getMoistureProofExpiring());
    }

    @Operation(summary = "获取物料统计数据")
    @GetMapping("/statistics")
    public Result<Map<String, Object>> getMaterialStatistics() {
        return Result.success(materialService.getMaterialStatistics());
    }

    @Operation(summary = "获取入库统计")
    @GetMapping("/inbound/statistics")
    public Result<Map<String, Object>> getInboundStatistics(
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate) {
        return Result.success(materialService.getInboundStatistics(startDate, endDate));
    }

    @Operation(summary = "获取出库统计")
    @GetMapping("/outbound/statistics")
    public Result<Map<String, Object>> getOutboundStatistics(
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate) {
        return Result.success(materialService.getOutboundStatistics(startDate, endDate));
    }

    @Operation(summary = "多条件组合分页查询物料")
    @PostMapping("/query")
    public Result<PageResult<Material>> queryByConditions(@RequestBody MaterialQueryDTO query) {
        return Result.success(materialService.queryMaterialByConditions(query));
    }

    @Operation(summary = "锁定库存")
    @PostMapping("/stock/lock")
    @RequiresRoles({RoleEnum.PRODUCTION, RoleEnum.ADMIN})
    @OperateLog(module = "原材仓储", operation = "锁定库存", description = "工单方案确认后锁定原料库存")
    public Result<Void> lockStock(
            @RequestParam Long workOrderId,
            @RequestParam Long materialId,
            @RequestParam String batchNo,
            @RequestParam BigDecimal quantity,
            @RequestParam(required = false) String operator) {
        materialService.lockStock(workOrderId, materialId, batchNo, quantity, operator);
        return Result.success();
    }

    @Operation(summary = "释放库存")
    @PutMapping("/stock/release")
    @RequiresRoles({RoleEnum.PRODUCTION, RoleEnum.ADMIN})
    @OperateLog(module = "原材仓储", operation = "释放库存", description = "释放工单锁定的原料库存")
    public Result<Void> releaseStock(
            @RequestParam Long workOrderId,
            @RequestParam(required = false) Long materialId) {
        if (materialId != null) {
            materialService.releaseStock(workOrderId, materialId);
        } else {
            materialService.releaseAllStockByWorkOrder(workOrderId);
        }
        return Result.success();
    }

    @Operation(summary = "获取工单锁定的库存列表")
    @GetMapping("/stock/lock/work-order/{workOrderId}")
    public Result<List<com.paper.production.entity.material.MaterialStockLock>> getStockLocksByWorkOrder(@PathVariable Long workOrderId) {
        return Result.success(materialService.getStockLocksByWorkOrder(workOrderId));
    }
}
