package com.fitness.manufacture.controller;

import com.fitness.manufacture.common.PageQuery;
import com.fitness.manufacture.common.PageResult;
import com.fitness.manufacture.common.Result;
import com.fitness.manufacture.dto.ProductDTO;
import com.fitness.manufacture.entity.Product;
import com.fitness.manufacture.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@Tag(name = "产品管理")
@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @Operation(summary = "新增产品")
    @PostMapping
    public Result<Void> saveProduct(@Valid @RequestBody ProductDTO dto) {
        productService.saveProduct(dto);
        return Result.success();
    }

    @Operation(summary = "修改产品")
    @PutMapping
    public Result<Void> updateProduct(@Valid @RequestBody ProductDTO dto) {
        productService.updateProduct(dto);
        return Result.success();
    }

    @Operation(summary = "删除产品")
    @DeleteMapping("/{id}")
    public Result<Void> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return Result.success();
    }

    @Operation(summary = "停止产品量产")
    @PutMapping("/{id}/stop-production")
    public Result<Void> stopProduction(@PathVariable Long id) {
        productService.stopProduction(id);
        return Result.success();
    }

    @Operation(summary = "设置产品排产优先级")
    @PutMapping("/{id}/priority")
    public Result<Void> updatePriority(@PathVariable Long id, @RequestParam Integer priority) {
        productService.updatePriority(id, priority);
        return Result.success();
    }

    @Operation(summary = "根据ID获取产品详情")
    @GetMapping("/{id}")
    public Result<ProductDTO> getProductById(@PathVariable Long id) {
        return Result.success(productService.getProductById(id));
    }

    @Operation(summary = "分页查询产品列表")
    @GetMapping("/page")
    public Result<PageResult<Product>> getProductPage(
            PageQuery query,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Integer status) {
        return Result.success(productService.getProductPage(query, categoryId, status));
    }
}
