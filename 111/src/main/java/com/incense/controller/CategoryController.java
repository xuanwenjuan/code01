package com.incense.controller;

import com.incense.annotation.OperationLog;
import com.incense.annotation.RequiresRole;
import com.incense.common.Result;
import com.incense.dto.CategoryDTO;
import com.incense.entity.Category;
import com.incense.service.CategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/category")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping("/tree")
    public Result<List<Category>> getTree() {
        return Result.success(categoryService.getTree());
    }

    @GetMapping("/active-tree")
    public Result<List<Category>> getActiveTree() {
        return Result.success(categoryService.getActiveTree());
    }

    @GetMapping("/list/{parentId}")
    public Result<List<Category>> getByParentId(@PathVariable Long parentId) {
        return Result.success(categoryService.getByParentId(parentId));
    }

    @GetMapping("/{id}")
    public Result<Category> getById(@PathVariable Long id) {
        return Result.success(categoryService.getById(id));
    }

    @PostMapping
    @RequiresRole({"ADMIN"})
    @OperationLog(module = "品类管理", operation = "新增品类")
    public Result<Void> add(@Valid @RequestBody CategoryDTO dto) {
        categoryService.addCategory(dto);
        return Result.success();
    }

    @PutMapping
    @RequiresRole({"ADMIN"})
    @OperationLog(module = "品类管理", operation = "编辑品类")
    public Result<Void> update(@Valid @RequestBody CategoryDTO dto) {
        categoryService.updateCategory(dto);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    @RequiresRole({"ADMIN"})
    @OperationLog(module = "品类管理", operation = "删除品类")
    public Result<Void> delete(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return Result.success();
    }
}
