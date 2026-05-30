package com.foundry.impeller.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.foundry.impeller.annotation.OperationLog;
import com.foundry.impeller.annotation.RequiresRole;
import com.foundry.impeller.common.Result;
import com.foundry.impeller.dto.MaterialQueryDTO;
import com.foundry.impeller.entity.Material;
import com.foundry.impeller.entity.MaterialInbound;
import com.foundry.impeller.service.MaterialService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/materials")
@RequiredArgsConstructor
public class MaterialController {

    private final MaterialService materialService;

    @GetMapping
    public Result<Page<Material>> list(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String materialType,
            @RequestParam(required = false) String status) {
        return Result.success(materialService.list(page, size, materialType, status));
    }

    @PostMapping("/query")
    public Result<Page<Material>> query(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestBody MaterialQueryDTO queryDTO) {
        return Result.success(materialService.queryByConditions(page, size, queryDTO));
    }

    @GetMapping("/warning")
    public Result<List<Material>> listWarning() {
        return Result.success(materialService.listWarning());
    }

    @GetMapping("/clumping-warning")
    public Result<List<Material>> listClumpingWarning() {
        return Result.success(materialService.listClumpingWarning());
    }

    @GetMapping("/{id}")
    public Result<Material> getById(@PathVariable Long id) {
        return Result.success(materialService.getById(id));
    }

    @PostMapping
    @RequiresRole({"PURCHASER", "ADMIN"})
    @OperationLog(value = "新增物料", module = "物料管理")
    public Result<Void> create(@Valid @RequestBody Material material) {
        materialService.create(material);
        return Result.success();
    }

    @PutMapping
    @RequiresRole({"PURCHASER", "ADMIN"})
    @OperationLog(value = "更新物料", module = "物料管理")
    public Result<Void> update(@Valid @RequestBody Material material) {
        materialService.update(material);
        return Result.success();
    }

    @PostMapping("/inbound")
    @RequiresRole({"PURCHASER", "ADMIN"})
    @OperationLog(value = "物料入库", module = "物料管理")
    public Result<Void> inbound(@Valid @RequestBody MaterialInbound inbound) {
        materialService.inbound(inbound);
        return Result.success();
    }

    @GetMapping("/inbound")
    @RequiresRole({"PURCHASER", "ADMIN"})
    public Result<Page<MaterialInbound>> listInbound(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String materialType,
            @RequestParam(required = false) String status) {
        return Result.success(materialService.listInbound(page, size, materialType, status));
    }

    @PutMapping("/{id}/stock")
    @RequiresRole({"PURCHASER", "ADMIN"})
    @OperationLog(value = "调整库存", module = "物料管理")
    public Result<Void> updateStock(@PathVariable Long id, @RequestParam BigDecimal quantity) {
        materialService.updateStock(id, quantity);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    @RequiresRole({"PURCHASER", "ADMIN"})
    @OperationLog(value = "删除物料", module = "物料管理")
    public Result<Void> delete(@PathVariable Long id) {
        materialService.delete(id);
        return Result.success();
    }
}
