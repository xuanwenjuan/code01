package com.cosmetics.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.cosmetics.annotation.RequireRole;
import com.cosmetics.common.PageQuery;
import com.cosmetics.common.Result;
import com.cosmetics.entity.Product;
import com.cosmetics.enums.UserRoleEnum;
import com.cosmetics.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@Tag(name = "产品管理")
@RestController
@RequestMapping("/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @Operation(summary = "分页查询产品列表")
    @GetMapping("/page")
    public Result<Page<Product>> getPage(
            @ModelAttribute PageQuery pageQuery,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Integer status) {
        return Result.success(productService.getPage(pageQuery, categoryId, keyword, status));
    }

    @Operation(summary = "获取产品详情")
    @GetMapping("/{id}")
    public Result<Product> getById(@PathVariable Long id) {
        return Result.success(productService.getById(id));
    }

    @Operation(summary = "新增产品")
    @PostMapping
    @RequireRole({UserRoleEnum.FORMULA_DEVELOPER, UserRoleEnum.PRODUCTION_LEADER})
    public Result<Void> add(@RequestBody Product product) {
        productService.add(product);
        return Result.success();
    }

    @Operation(summary = "更新产品")
    @PutMapping
    @RequireRole({UserRoleEnum.FORMULA_DEVELOPER, UserRoleEnum.PRODUCTION_LEADER})
    public Result<Void> update(@RequestBody Product product) {
        productService.update(product);
        return Result.success();
    }

    @Operation(summary = "删除产品")
    @DeleteMapping("/{id}")
    @RequireRole({UserRoleEnum.FORMULA_DEVELOPER, UserRoleEnum.PRODUCTION_LEADER})
    public Result<Void> delete(@PathVariable Long id) {
        productService.delete(id);
        return Result.success();
    }

    @Operation(summary = "更新产品状态（上架/下架）")
    @PutMapping("/{id}/status")
    @RequireRole({UserRoleEnum.FORMULA_DEVELOPER, UserRoleEnum.PRODUCTION_LEADER})
    public Result<Void> updateStatus(@PathVariable Long id, @RequestParam Integer status) {
        productService.updateStatus(id, status);
        return Result.success();
    }
}
