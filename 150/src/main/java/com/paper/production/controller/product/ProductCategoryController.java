package com.paper.production.controller.product;

import com.paper.production.annotation.OperateLog;
import com.paper.production.annotation.RequiresRoles;
import com.paper.production.common.Result;
import com.paper.production.dto.product.ProductCategoryDTO;
import com.paper.production.entity.product.ProductCategory;
import com.paper.production.enums.RoleEnum;
import com.paper.production.service.product.ProductCategoryService;
import com.paper.production.vo.product.ProductCategoryTreeVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.annotation.Resource;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "包装产品分类管理")
@RestController
@RequestMapping("/product/category")
public class ProductCategoryController {

    @Resource
    private ProductCategoryService productCategoryService;

    @Operation(summary = "新增产品分类")
    @PostMapping
    @RequiresRoles({RoleEnum.PROCESS, RoleEnum.ADMIN})
    @OperateLog(module = "产品分类", operation = "新增分类", description = "新增产品分类")
    public Result<Void> save(@Valid @RequestBody ProductCategoryDTO dto) {
        productCategoryService.saveCategory(dto);
        return Result.success();
    }

    @Operation(summary = "修改产品分类")
    @PutMapping
    @RequiresRoles({RoleEnum.PROCESS, RoleEnum.ADMIN})
    @OperateLog(module = "产品分类", operation = "修改分类", description = "修改产品分类信息")
    public Result<Void> update(@Valid @RequestBody ProductCategoryDTO dto) {
        productCategoryService.updateCategory(dto);
        return Result.success();
    }

    @Operation(summary = "删除产品分类")
    @DeleteMapping("/{id}")
    @RequiresRoles({RoleEnum.PROCESS, RoleEnum.ADMIN})
    @OperateLog(module = "产品分类", operation = "删除分类", description = "删除产品分类")
    public Result<Void> delete(@PathVariable Long id) {
        productCategoryService.deleteCategory(id);
        return Result.success();
    }

    @Operation(summary = "获取分类树形结构")
    @GetMapping("/tree")
    public Result<List<ProductCategoryTreeVO>> getTree() {
        return Result.success(productCategoryService.getCategoryTree());
    }

    @Operation(summary = "根据类型获取分类树形结构")
    @GetMapping("/tree/type/{categoryType}")
    public Result<List<ProductCategoryTreeVO>> getTreeByType(@PathVariable String categoryType) {
        return Result.success(productCategoryService.getCategoryTreeByType(categoryType));
    }

    @Operation(summary = "获取分类列表")
    @GetMapping("/list")
    public Result<List<ProductCategory>> list() {
        return Result.success(productCategoryService.list());
    }

    @Operation(summary = "获取分类详情")
    @GetMapping("/{id}")
    public Result<ProductCategory> getById(@PathVariable Long id) {
        return Result.success(productCategoryService.getById(id));
    }

    @Operation(summary = "停止排产")
    @PutMapping("/stop/{id}")
    @RequiresRoles({RoleEnum.PROCESS, RoleEnum.PRODUCTION, RoleEnum.ADMIN})
    @OperateLog(module = "产品分类", operation = "停止排产", description = "停止该分类产品排产")
    public Result<Void> stopProduction(@PathVariable Long id) {
        productCategoryService.stopProduction(id);
        return Result.success();
    }

    @Operation(summary = "调整优先级")
    @PutMapping("/priority/{id}/{priority}")
    @RequiresRoles({RoleEnum.PROCESS, RoleEnum.PRODUCTION, RoleEnum.ADMIN})
    @OperateLog(module = "产品分类", operation = "调整优先级", description = "调整产品分类优先级")
    public Result<Void> updatePriority(@PathVariable Long id, @PathVariable Integer priority) {
        productCategoryService.updatePriority(id, priority);
        return Result.success();
    }
}
