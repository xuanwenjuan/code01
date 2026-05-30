package com.rotor.manufacture.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.rotor.manufacture.annotation.RequiresRole;
import com.rotor.manufacture.common.Result;
import com.rotor.manufacture.dto.MaterialOperationDTO;
import com.rotor.manufacture.dto.MaterialQueryDTO;
import com.rotor.manufacture.dto.PageQueryDTO;
import com.rotor.manufacture.entity.Material;
import com.rotor.manufacture.entity.OrderMaterial;
import com.rotor.manufacture.service.MaterialService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/material")
@RequiredArgsConstructor
public class MaterialController {

    private final MaterialService materialService;

    @PostMapping
    @RequiresRole({"ADMIN", "PURCHASE"})
    public Result<Void> addMaterial(@RequestBody Material material) {
        materialService.addMaterial(material);
        return Result.success();
    }

    @PutMapping
    @RequiresRole({"ADMIN", "PURCHASE"})
    public Result<Void> updateMaterial(@RequestBody Material material) {
        materialService.updateMaterial(material);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    @RequiresRole({"ADMIN"})
    public Result<Void> deleteMaterial(@PathVariable Long id) {
        materialService.deleteMaterial(id);
        return Result.success();
    }

    @GetMapping("/{id}")
    public Result<Material> getById(@PathVariable Long id) {
        Material material = materialService.getById(id);
        return Result.success(material);
    }

    @GetMapping("/list")
    public Result<List<Material>> list() {
        List<Material> list = materialService.list();
        return Result.success(list);
    }

    @PostMapping("/page")
    public Result<Page<Material>> pageQuery(@RequestBody PageQueryDTO queryDTO) {
        Page<Material> page = materialService.pageQuery(queryDTO);
        return Result.success(page);
    }

    @PostMapping("/query")
    public Result<Page<Material>> queryByConditions(@Valid @RequestBody MaterialQueryDTO queryDTO) {
        Page<Material> page = materialService.queryByConditions(queryDTO);
        return Result.success(page);
    }

    @GetMapping("/warning")
    @RequiresRole({"ADMIN", "PURCHASE", "PRODUCTION", "GROUP_LEADER"})
    public Result<List<Material>> getWarningMaterials() {
        List<Material> list = materialService.getWarningMaterials();
        return Result.success(list);
    }

    @GetMapping("/expiring-magnets")
    @RequiresRole({"ADMIN", "PURCHASE", "QUALITY"})
    public Result<List<Material>> getExpiringMagnets() {
        List<Material> list = materialService.getExpiringMagnets();
        return Result.success(list);
    }

    @PutMapping("/{id}/stock")
    @RequiresRole({"ADMIN", "PURCHASE"})
    public Result<Void> updateStock(@PathVariable Long id, @RequestParam BigDecimal quantity) {
        materialService.updateStock(id, quantity);
        return Result.success();
    }

    @PostMapping("/lock")
    @RequiresRole({"ADMIN", "GROUP_LEADER"})
    public Result<Void> lockMaterial(@RequestParam Long materialId,
                                     @RequestParam Long orderId,
                                     @RequestParam BigDecimal quantity) {
        materialService.lockMaterial(materialId, orderId, quantity);
        return Result.success();
    }

    @PostMapping("/unlock")
    @RequiresRole({"ADMIN", "GROUP_LEADER"})
    public Result<Void> unlockMaterial(@RequestParam Long materialId,
                                       @RequestParam Long orderId,
                                       @RequestParam BigDecimal quantity) {
        materialService.unlockMaterial(materialId, orderId, quantity);
        return Result.success();
    }

    @PostMapping("/pick")
    @RequiresRole({"ADMIN", "PRODUCTION", "GROUP_LEADER"})
    public Result<Void> pickMaterial(@Valid @RequestBody MaterialOperationDTO dto) {
        materialService.pickMaterial(dto);
        return Result.success();
    }

    @PostMapping("/return")
    @RequiresRole({"ADMIN", "PRODUCTION", "GROUP_LEADER"})
    public Result<Void> returnMaterial(@Valid @RequestBody MaterialOperationDTO dto) {
        materialService.returnMaterial(dto);
        return Result.success();
    }

    @PostMapping("/scrap")
    @RequiresRole({"ADMIN", "QUALITY", "GROUP_LEADER"})
    public Result<Void> scrapMaterial(@Valid @RequestBody MaterialOperationDTO dto) {
        materialService.scrapMaterial(dto);
        return Result.success();
    }

    @GetMapping("/order/{orderId}")
    @RequiresRole({"ADMIN", "PRODUCTION", "GROUP_LEADER", "FINANCE"})
    public Result<List<OrderMaterial>> getOrderMaterials(@PathVariable Long orderId) {
        List<OrderMaterial> list = materialService.getOrderMaterials(orderId);
        return Result.success(list);
    }
}