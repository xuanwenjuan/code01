package com.textile.production.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.textile.production.annotation.RequiresRole;
import com.textile.production.common.Result;
import com.textile.production.common.RoleConstants;
import com.textile.production.dto.MaterialQueryDTO;
import com.textile.production.dto.RawMaterialDTO;
import com.textile.production.dto.RawMaterialBatchDTO;
import com.textile.production.entity.RawMaterial;
import com.textile.production.entity.RawMaterialBatch;
import com.textile.production.service.RawMaterialBatchService;
import com.textile.production.service.RawMaterialService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/raw-material")
@RequiredArgsConstructor
public class RawMaterialController {

    private final RawMaterialService materialService;
    private final RawMaterialBatchService batchService;

    @GetMapping("/page")
    public Result<IPage<RawMaterial>> getMaterialPage(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String keyword) {
        return materialService.getPage(pageNum, pageSize, type, status, keyword);
    }

    @GetMapping("/list")
    public Result<List<RawMaterial>> getMaterialList(@RequestParam(required = false) String type) {
        return materialService.getList(type);
    }

    @GetMapping("/{id}")
    public Result<RawMaterial> getMaterialById(@PathVariable Long id) {
        return Result.success(materialService.getById(id));
    }

    @PostMapping
    @RequiresRole({RoleConstants.ADMIN, RoleConstants.PURCHASER})
    public Result<RawMaterial> addMaterial(@Valid @RequestBody RawMaterialDTO dto) {
        return materialService.addMaterial(dto);
    }

    @PutMapping
    @RequiresRole({RoleConstants.ADMIN, RoleConstants.PURCHASER})
    public Result<RawMaterial> updateMaterial(@Valid @RequestBody RawMaterialDTO dto) {
        return materialService.updateMaterial(dto);
    }

    @DeleteMapping("/{id}")
    @RequiresRole({RoleConstants.ADMIN, RoleConstants.PURCHASER})
    public Result<Void> deleteMaterial(@PathVariable Long id) {
        return materialService.deleteMaterial(id);
    }

    @GetMapping("/warning")
    public Result<List<RawMaterial>> getWarningList() {
        return materialService.getWarningList();
    }

    @GetMapping("/batch/page")
    public Result<IPage<RawMaterialBatch>> getBatchPage(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) Long materialId,
            @RequestParam(required = false) Integer status) {
        return batchService.getPage(pageNum, pageSize, materialId, status);
    }

    @GetMapping("/batch/available/{materialId}")
    public Result<List<RawMaterialBatch>> getAvailableBatches(@PathVariable Long materialId) {
        return batchService.getAvailableBatches(materialId);
    }

    @PostMapping("/batch")
    @RequiresRole({RoleConstants.ADMIN, RoleConstants.PURCHASER})
    public Result<RawMaterialBatch> addBatch(@Valid @RequestBody RawMaterialBatchDTO dto) {
        return batchService.addBatch(dto);
    }

    @PutMapping("/batch/{batchId}/use")
    @RequiresRole({RoleConstants.ADMIN, RoleConstants.SUPERVISOR})
    public Result<Void> useBatch(@PathVariable Long batchId, @RequestParam BigDecimal quantity) {
        return batchService.useBatch(batchId, quantity);
    }

    @PutMapping("/batch/{batchId}/humidity")
    @RequiresRole({RoleConstants.ADMIN, RoleConstants.PURCHASER})
    public Result<Void> updateHumidity(@PathVariable Long batchId, @RequestParam BigDecimal humidity) {
        return batchService.updateHumidity(batchId, humidity);
    }

    @GetMapping("/batch/moisture-warning")
    public Result<List<RawMaterialBatch>> getMoistureWarningList() {
        return batchService.getMoistureWarningList();
    }

    @GetMapping("/with-batches")
    public Result<List<RawMaterial>> getMaterialWithAvailableBatches(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String keyword) {
        return materialService.getMaterialWithAvailableBatches(type, status, keyword);
    }

    @GetMapping("/statistics/stock")
    public Result<List<Map<String, Object>>> getMaterialStockStatistics() {
        return materialService.getMaterialStockStatistics();
    }

    @GetMapping("/statistics/batch-usage")
    public Result<List<Map<String, Object>>> getBatchUsageStatistics(
            @RequestParam(required = false) LocalDateTime startDate,
            @RequestParam(required = false) LocalDateTime endDate) {
        return materialService.getBatchUsageStatistics(startDate, endDate);
    }

    @PostMapping("/query")
    public Result<IPage<RawMaterial>> queryMaterials(@RequestBody MaterialQueryDTO query) {
        return materialService.queryMaterials(query);
    }
}
