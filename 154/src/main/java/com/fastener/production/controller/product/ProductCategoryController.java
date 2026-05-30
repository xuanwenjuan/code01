package com.fastener.production.controller.product;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.fastener.production.common.annotation.RequiresPermission;
import com.fastener.production.common.entity.PageQuery;
import com.fastener.production.common.result.Result;
import com.fastener.production.entity.product.ProductCategory;
import com.fastener.production.entity.product.dto.ProductCategoryDTO;
import com.fastener.production.entity.product.vo.ProductCategoryTreeVO;
import com.fastener.production.service.product.ProductCategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "产品分类管理", description = "紧固件产品分类管理接口")
@RestController
@RequestMapping("/product/category")
@RequiredArgsConstructor
public class ProductCategoryController {

    private final ProductCategoryService productCategoryService;

    @Operation(summary = "分页查询分类列表")
    @GetMapping("/page")
    public Result<IPage<ProductCategory>> page(PageQuery pageQuery,
                                               @RequestParam(required = false) String categoryName,
                                               @RequestParam(required = false) Integer status) {
        return Result.success(productCategoryService.page(pageQuery, categoryName, status));
    }

    @Operation(summary = "获取分类树形结构")
    @GetMapping("/tree")
    public Result<ProductCategoryTreeVO> getTree() {
        return Result.success(productCategoryService.getTree());
    }

    @Operation(summary = "获取子分类列表")
    @GetMapping("/children/{parentId}")
    public Result<List<ProductCategoryTreeVO>> getChildren(@PathVariable Long parentId) {
        return Result.success(productCategoryService.getChildren(parentId));
    }

    @Operation(summary = "获取分类详情")
    @GetMapping("/{id}")
    public Result<ProductCategory> getById(@PathVariable Long id) {
        return Result.success(productCategoryService.getById(id));
    }

    @Operation(summary = "新增分类")
    @PostMapping
    @RequiresPermission("process:compile")
    public Result<Void> add(@Valid @RequestBody ProductCategoryDTO dto) {
        productCategoryService.add(dto);
        return Result.success();
    }

    @Operation(summary = "修改分类")
    @PutMapping
    @RequiresPermission("process:compile")
    public Result<Void> update(@Valid @RequestBody ProductCategoryDTO dto) {
        productCategoryService.update(dto);
        return Result.success();
    }

    @Operation(summary = "删除分类")
    @DeleteMapping("/{id}")
    @RequiresPermission("process:compile")
    public Result<Void> delete(@PathVariable Long id) {
        productCategoryService.delete(id);
        return Result.success();
    }

    @Operation(summary = "更新分类状态")
    @PutMapping("/status/{id}/{status}")
    @RequiresPermission("process:compile")
    public Result<Void> updateStatus(@PathVariable Long id, @PathVariable Integer status) {
        productCategoryService.updateStatus(id, status);
        return Result.success();
    }
}
