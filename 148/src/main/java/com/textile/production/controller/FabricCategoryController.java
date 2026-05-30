package com.textile.production.controller;

import com.textile.production.annotation.RequiresRole;
import com.textile.production.common.Result;
import com.textile.production.common.RoleConstants;
import com.textile.production.dto.FabricCategoryDTO;
import com.textile.production.entity.FabricCategory;
import com.textile.production.service.FabricCategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/fabric-category")
@RequiredArgsConstructor
public class FabricCategoryController {

    private final FabricCategoryService fabricCategoryService;

    @GetMapping("/tree")
    public Result<List<FabricCategory>> getTree() {
        return fabricCategoryService.getTree();
    }

    @GetMapping("/{id}")
    public Result<FabricCategory> getById(@PathVariable Long id) {
        return fabricCategoryService.getCategoryById(id);
    }

    @GetMapping("/parent/{parentId}")
    public Result<List<FabricCategory>> getByParentId(@PathVariable Long parentId) {
        return fabricCategoryService.getByParentId(parentId);
    }

    @PostMapping
    @RequiresRole({RoleConstants.ADMIN, RoleConstants.TECHNICIAN})
    public Result<FabricCategory> add(@Valid @RequestBody FabricCategoryDTO dto) {
        return fabricCategoryService.addCategory(dto);
    }

    @PutMapping
    @RequiresRole({RoleConstants.ADMIN, RoleConstants.TECHNICIAN})
    public Result<FabricCategory> update(@Valid @RequestBody FabricCategoryDTO dto) {
        return fabricCategoryService.updateCategory(dto);
    }

    @DeleteMapping("/{id}")
    @RequiresRole({RoleConstants.ADMIN, RoleConstants.TECHNICIAN})
    public Result<Void> delete(@PathVariable Long id) {
        return fabricCategoryService.deleteCategory(id);
    }

    @PutMapping("/{id}/priority/{priority}")
    @RequiresRole({RoleConstants.ADMIN, RoleConstants.TECHNICIAN})
    public Result<Void> updatePriority(@PathVariable Long id, @PathVariable Integer priority) {
        return fabricCategoryService.updatePriority(id, priority);
    }

    @PutMapping("/{id}/toggle-status")
    @RequiresRole({RoleConstants.ADMIN, RoleConstants.TECHNICIAN})
    public Result<Void> toggleStatus(@PathVariable Long id) {
        return fabricCategoryService.toggleStatus(id);
    }
}
