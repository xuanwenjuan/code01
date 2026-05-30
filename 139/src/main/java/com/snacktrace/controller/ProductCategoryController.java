package com.snacktrace.controller;

import com.snacktrace.annotation.RequireRole;
import com.snacktrace.common.Result;
import com.snacktrace.entity.ProductCategory;
import com.snacktrace.enums.RoleEnum;
import com.snacktrace.service.ProductCategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/category")
public class ProductCategoryController {

    @Autowired
    private ProductCategoryService categoryService;

    @GetMapping("/tree")
    public Result<List<ProductCategory>> getTree() {
        List<ProductCategory> tree = categoryService.getTree();
        return Result.success(tree);
    }

    @PostMapping
    @RequireRole({RoleEnum.ADMIN, RoleEnum.R_D})
    public Result<Void> addCategory(@RequestBody ProductCategory category) {
        boolean success = categoryService.addCategory(category);
        return success ? Result.success("添加成功", null) : Result.error("添加失败");
    }

    @PutMapping
    @RequireRole({RoleEnum.ADMIN, RoleEnum.R_D})
    public Result<Void> updateCategory(@RequestBody ProductCategory category) {
        boolean success = categoryService.updateCategory(category);
        return success ? Result.success("更新成功", null) : Result.error("更新失败");
    }

    @DeleteMapping("/{id}")
    @RequireRole({RoleEnum.ADMIN, RoleEnum.R_D})
    public Result<Void> deleteCategory(@PathVariable Long id) {
        boolean success = categoryService.deleteCategory(id);
        return success ? Result.success("删除成功", null) : Result.error("删除失败");
    }
}
