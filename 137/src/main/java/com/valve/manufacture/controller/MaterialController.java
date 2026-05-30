package com.valve.manufacture.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.valve.manufacture.annotation.RequiresRole;
import com.valve.manufacture.common.Result;
import com.valve.manufacture.constant.RoleConstants;
import com.valve.manufacture.dto.MaterialInboundDTO;
import com.valve.manufacture.dto.MaterialQueryDTO;
import com.valve.manufacture.entity.Material;
import com.valve.manufacture.entity.MaterialBatch;
import com.valve.manufacture.service.MaterialBatchService;
import com.valve.manufacture.service.MaterialService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/materials")
@RequiredArgsConstructor
@RequiresRole({RoleConstants.ADMIN, RoleConstants.PURCHASE, RoleConstants.PRODUCTION, RoleConstants.QUALITY})
public class MaterialController {

    private final MaterialService materialService;
    private final MaterialBatchService materialBatchService;

    @GetMapping
    public Result<Page<Material>> page(
            @RequestParam(defaultValue = "1") Integer current,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) String materialName,
            @RequestParam(required = false) String materialType,
            @RequestParam(required = false) Integer status) {
        MaterialQueryDTO queryDTO = new MaterialQueryDTO();
        queryDTO.setMaterialName(materialName);
        queryDTO.setMaterialType(materialType);
        queryDTO.setStatus(status);
        Page<Material> page = materialService.queryByConditions(current, size, queryDTO);
        return Result.success(page);
    }

    @PostMapping("/search")
    public Result<Page<Material>> search(
            @RequestParam(defaultValue = "1") Integer current,
            @RequestParam(defaultValue = "10") Integer size,
            @Valid @RequestBody MaterialQueryDTO queryDTO) {
        Page<Material> page = materialService.queryByConditions(current, size, queryDTO);
        return Result.success(page);
    }

    @GetMapping("/{id}")
    public Result<Material> getById(@PathVariable Long id) {
        Material material = materialService.getById(id);
        return Result.success(material);
    }

    @GetMapping("/rust-remind")
    @RequiresRole({RoleConstants.ADMIN, RoleConstants.PURCHASE, RoleConstants.QUALITY})
    public Result<List<Material>> getRustRemindList() {
        List<Material> list = materialService.getRustRemindList();
        return Result.success(list);
    }

    @GetMapping("/low-stock")
    @RequiresRole({RoleConstants.ADMIN, RoleConstants.PURCHASE})
    public Result<List<Material>> getLowStockMaterials() {
        List<Material> list = materialService.getLowStockMaterials();
        return Result.success(list);
    }

    @GetMapping("/statistics")
    public Result<Map<String, Long>> getStatistics() {
        Map<String, Long> statistics = new HashMap<>();
        statistics.put("outOfStock", materialService.countByStatus(0));
        statistics.put("lowStock", materialService.countByStatus(1));
        statistics.put("sufficient", materialService.countByStatus(2));
        return Result.success(statistics);
    }

    @PostMapping
    @RequiresRole({RoleConstants.ADMIN, RoleConstants.PURCHASE})
    public Result<Material> create(@Valid @RequestBody Material material) {
        Material created = materialService.create(material);
        return Result.success("创建成功", created);
    }

    @PutMapping("/{id}")
    @RequiresRole({RoleConstants.ADMIN, RoleConstants.PURCHASE})
    public Result<Material> update(@PathVariable Long id, @Valid @RequestBody Material material) {
        Material updated = materialService.update(id, material);
        return Result.success("更新成功", updated);
    }

    @DeleteMapping("/{id}")
    @RequiresRole(RoleConstants.ADMIN)
    public Result<Void> delete(@PathVariable Long id) {
        materialService.delete(id);
        return Result.success("删除成功");
    }

    @PostMapping("/batch-status")
    @RequiresRole(RoleConstants.ADMIN)
    public Result<Void> batchUpdateStatus(@RequestBody Map<String, Object> request) {
        List<Long> ids = (List<Long>) request.get("ids");
        Integer status = (Integer) request.get("status");
        materialService.batchUpdateStatus(ids, status);
        return Result.success("批量更新成功");
    }
    
    @PostMapping("/batch-delete")
    @RequiresRole(RoleConstants.ADMIN)
    public Result<Void> batchDelete(@RequestBody List<Long> ids) {
        materialService.batchDelete(ids);
        return Result.success("批量删除成功");
    }

    @PostMapping("/{id}/rust-check")
    @RequiresRole({RoleConstants.ADMIN, RoleConstants.PURCHASE, RoleConstants.QUALITY})
    public Result<Void> updateRustCheck(@PathVariable Long id,
                                         @RequestBody Map<String, @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate> request) {
        LocalDate checkDate = request.get("checkDate");
        if (checkDate == null) {
            checkDate = LocalDate.now();
        }
        materialService.updateRustCheck(id, checkDate);
        return Result.success("防锈检查更新成功");
    }
    
    @GetMapping("/{id}/batches")
    public Result<List<MaterialBatch>> getBatches(@PathVariable Long id) {
        List<MaterialBatch> batches = materialBatchService.getByMaterialId(id);
        return Result.success(batches);
    }
    
    @PostMapping("/{id}/inbound")
    @RequiresRole({RoleConstants.ADMIN, RoleConstants.PURCHASE})
    public Result<MaterialBatch> inbound(@PathVariable Long id,
                                          @Valid @RequestBody MaterialInboundDTO dto) {
        MaterialBatch batch = materialBatchService.inbound(
                id,
                dto.getQuantity(),
                dto.getUnitPrice() != null ? dto.getUnitPrice() : java.math.BigDecimal.ZERO,
                dto.getSupplier(),
                dto.getWarehouseLocation(),
                dto.getRemark()
        );
        return Result.success("入库成功", batch);
    }
}
