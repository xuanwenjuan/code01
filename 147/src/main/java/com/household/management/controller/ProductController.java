package com.household.management.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.household.management.common.annotation.OperationLog;
import com.household.management.common.entity.PageQuery;
import com.household.management.common.result.Result;
import com.household.management.entity.Product;
import com.household.management.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "产品管理")
@RestController
@RequestMapping("/product")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping("/page")
    @Operation(summary = "分页查询产品列表")
    public Result<IPage<Product>> page(PageQuery pageQuery,
                                       @RequestParam(required = false) String productName,
                                       @RequestParam(required = false) Long categoryId,
                                       @RequestParam(required = false) Integer status) {
        return Result.success(productService.page(pageQuery, productName, categoryId, status));
    }

    @GetMapping("/list")
    @Operation(summary = "获取产品列表")
    public Result<List<Product>> list() {
        return Result.success(productService.list());
    }

    @GetMapping("/{id}")
    @Operation(summary = "获取产品详情")
    public Result<Product> getById(@PathVariable Long id) {
        return Result.success(productService.getById(id));
    }

    @PostMapping
    @Operation(summary = "新增产品")
    @OperationLog(module = "产品管理", operation = "新增产品")
    public Result<Void> add(@Valid @RequestBody Product product) {
        productService.add(product);
        return Result.success();
    }

    @PutMapping
    @Operation(summary = "更新产品")
    @OperationLog(module = "产品管理", operation = "更新产品")
    public Result<Void> update(@Valid @RequestBody Product product) {
        productService.update(product);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "删除产品")
    @OperationLog(module = "产品管理", operation = "删除产品")
    public Result<Void> delete(@PathVariable Long id) {
        productService.delete(id);
        return Result.success();
    }

    @PutMapping("/{id}/status")
    @Operation(summary = "更新产品状态（上架/下架）")
    @OperationLog(module = "产品管理", operation = "更新产品状态")
    public Result<Void> updateStatus(@PathVariable Long id, @RequestParam Integer status) {
        productService.updateStatus(id, status);
        return Result.success();
    }

    @PutMapping("/{id}/priority")
    @Operation(summary = "更新产品销售优先级")
    @OperationLog(module = "产品管理", operation = "更新销售优先级")
    public Result<Void> updatePriority(@PathVariable Long id, @RequestParam Integer priority) {
        productService.updatePriority(id, priority);
        return Result.success();
    }
}
