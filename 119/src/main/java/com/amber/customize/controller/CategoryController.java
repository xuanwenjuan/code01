package com.amber.customize.controller;

import com.amber.customize.annotation.OperateLog;
import com.amber.customize.annotation.RequireRole;
import com.amber.customize.common.Result;
import com.amber.customize.entity.Category;
import com.amber.customize.service.CategoryService;
import com.amber.customize.vo.CategoryVO;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/category")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping("/tree")
    public Result<List<CategoryVO>> tree() {
        return Result.success(categoryService.tree());
    }

    @GetMapping("/tree-all")
    @RequireRole({4})
    public Result<List<CategoryVO>> treeAll() {
        return Result.success(categoryService.treeAll());
    }

    @GetMapping("/hot")
    public Result<List<CategoryVO>> getHotCategories() {
        return Result.success(categoryService.getHotCategories());
    }

    @GetMapping("/list")
    public Result<List<CategoryVO>> listByStatus(@RequestParam(required = false) Integer status) {
        if (status != null) {
            return Result.success(categoryService.listByStatus(status));
        }
        return Result.success(categoryService.listByStatus(1));
    }

    @GetMapping("/{id}")
    public Result<CategoryVO> getById(@PathVariable Long id) {
        return Result.success(categoryService.getDetail(id));
    }

    @PostMapping
    @RequireRole({4})
    @OperateLog(module = "类目管理", operation = "新增类目")
    public Result<Void> add(@Valid @RequestBody CategoryDTO dto) {
        Category category = new Category();
        category.setName(dto.getName());
        category.setParentId(dto.getParentId() != null ? dto.getParentId() : 0L);
        category.setSort(dto.getSort() != null ? dto.getSort() : 0);
        category.setStatus(dto.getStatus() != null ? dto.getStatus() : 1);
        categoryService.add(category);
        return Result.success();
    }

    @PutMapping
    @RequireRole({4})
    @OperateLog(module = "类目管理", operation = "更新类目")
    public Result<Void> update(@Valid @RequestBody CategoryDTO dto) {
        if (dto.getId() == null) {
            return Result.error("ID不能为空");
        }
        Category category = new Category();
        category.setId(dto.getId());
        category.setName(dto.getName());
        category.setParentId(dto.getParentId() != null ? dto.getParentId() : 0L);
        category.setSort(dto.getSort() != null ? dto.getSort() : 0);
        category.setStatus(dto.getStatus() != null ? dto.getStatus() : 1);
        categoryService.update(category);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    @RequireRole({4})
    @OperateLog(module = "类目管理", operation = "删除类目")
    public Result<Void> delete(@PathVariable Long id) {
        categoryService.delete(id);
        return Result.success();
    }

    @Data
    public static class CategoryDTO {
        private Long id;

        @NotBlank(message = "类目名称不能为空")
        private String name;

        private Long parentId;

        private Integer sort;

        private Integer status;
    }

}
