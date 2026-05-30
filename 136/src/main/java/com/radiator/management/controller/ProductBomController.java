package com.radiator.management.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.radiator.management.annotation.OpLog;
import com.radiator.management.annotation.RequiresRole;
import com.radiator.management.common.Result;
import com.radiator.management.entity.ProductBom;
import com.radiator.management.entity.ProductBomDetail;
import com.radiator.management.service.ProductBomService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bom")
@RequiredArgsConstructor
@RequiresRole({"production_leader", "assembly_technician"})
public class ProductBomController {

    private final ProductBomService productBomService;

    @PostMapping
    @OpLog(module = "BOM管理", operation = "创建BOM")
    public Result<Void> createBom(@RequestBody ProductBom bom) {
        productBomService.createBom(bom);
        return Result.success();
    }

    @PutMapping
    @OpLog(module = "BOM管理", operation = "更新BOM")
    public Result<Void> updateBom(@RequestBody ProductBom bom) {
        productBomService.updateBom(bom);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    @OpLog(module = "BOM管理", operation = "删除BOM")
    public Result<Void> deleteBom(@PathVariable Long id) {
        productBomService.deleteBom(id);
        return Result.success();
    }

    @GetMapping("/page")
    public Result<Page<ProductBom>> listBoms(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String keyword) {
        return Result.success(productBomService.listBoms(page, size, categoryId, keyword));
    }

    @GetMapping("/{id}")
    public Result<ProductBom> getBomById(@PathVariable Long id) {
        return Result.success(productBomService.getBomById(id));
    }

    @GetMapping("/category/{categoryId}")
    public Result<ProductBom> getBomByCategoryId(@PathVariable Long categoryId) {
        return Result.success(productBomService.getBomByCategoryId(categoryId));
    }

    @GetMapping("/{id}/details")
    public Result<List<ProductBomDetail>> getBomDetails(@PathVariable Long id) {
        return Result.success(productBomService.getBomDetails(id));
    }
}
