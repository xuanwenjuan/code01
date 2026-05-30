package com.hydraulic.piston.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.hydraulic.piston.annotation.Log;
import com.hydraulic.piston.common.Result;
import com.hydraulic.piston.dto.PistonCategoryDTO;
import com.hydraulic.piston.service.PistonCategoryService;
import com.hydraulic.piston.vo.PistonCategoryVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "活塞产品分类接口")
@RestController
@RequestMapping("/api/piston-category")
@RequiredArgsConstructor
public class PistonCategoryController {

    private final PistonCategoryService categoryService;

    @Operation(summary = "分页查询分类列表")
    @GetMapping("/page")
    public Result<Page<PistonCategoryVO>> getPage(
            @Parameter(description = "页码") @RequestParam(defaultValue = "1") Integer pageNum,
            @Parameter(description = "每页条数") @RequestParam(defaultValue = "10") Integer pageSize,
            @Parameter(description = "分类名称") @RequestParam(required = false) String categoryName,
            @Parameter(description = "状态 0-下线 1-启用") @RequestParam(required = false) Integer status) {
        return Result.success(categoryService.getPage(pageNum, pageSize, categoryName, status));
    }

    @Operation(summary = "查询分类列表(不分页)")
    @GetMapping("/list")
    public Result<List<PistonCategoryVO>> getList(
            @Parameter(description = "分类名称") @RequestParam(required = false) String categoryName,
            @Parameter(description = "状态 0-下线 1-启用") @RequestParam(required = false) Integer status) {
        return Result.success(categoryService.getList(categoryName, status));
    }

    @Operation(summary = "获取分类树形结构")
    @GetMapping("/tree")
    public Result<List<PistonCategoryVO>> getTree() {
        return Result.success(categoryService.getTree());
    }

    @Operation(summary = "根据ID获取分类详情")
    @GetMapping("/{id}")
    public Result<PistonCategoryVO> getById(@Parameter(description = "分类ID") @PathVariable Long id) {
        return Result.success(categoryService.getById(id));
    }

    @Operation(summary = "根据父ID获取子分类列表")
    @GetMapping("/parent/{parentId}/children")
    public Result<List<PistonCategoryVO>> getChildrenByParentId(@Parameter(description = "父分类ID") @PathVariable Long parentId) {
        return Result.success(categoryService.getChildrenByParentId(parentId));
    }

    @Operation(summary = "新增分类")
    @Log(module = "活塞产品分类", operation = "新增分类")
    @PostMapping
    public Result<Void> create(@Valid @RequestBody PistonCategoryDTO dto) {
        categoryService.create(dto);
        return Result.success("新增成功");
    }

    @Operation(summary = "更新分类")
    @Log(module = "活塞产品分类", operation = "更新分类")
    @PutMapping
    public Result<Void> update(@Valid @RequestBody PistonCategoryDTO dto) {
        categoryService.update(dto);
        return Result.success("更新成功");
    }

    @Operation(summary = "删除分类")
    @Log(module = "活塞产品分类", operation = "删除分类")
    @DeleteMapping("/{id}")
    public Result<Void> delete(@Parameter(description = "分类ID") @PathVariable Long id) {
        categoryService.delete(id);
        return Result.success("删除成功");
    }

    @Operation(summary = "调整排产优先级")
    @Log(module = "活塞产品分类", operation = "调整排产优先级")
    @PutMapping("/{id}/priority")
    public Result<Void> updatePriority(
            @Parameter(description = "分类ID") @PathVariable Long id,
            @Parameter(description = "优先级") @RequestParam Integer priority) {
        categoryService.updatePriority(id, priority);
        return Result.success("优先级调整成功");
    }

    @Operation(summary = "分类下线停产")
    @Log(module = "活塞产品分类", operation = "分类下线停产")
    @PutMapping("/{id}/offline")
    public Result<Void> offline(@Parameter(description = "分类ID") @PathVariable Long id) {
        categoryService.offline(id);
        return Result.success("分类已下线");
    }

    @Operation(summary = "分类启用上线")
    @Log(module = "活塞产品分类", operation = "分类启用上线")
    @PutMapping("/{id}/online")
    public Result<Void> online(@Parameter(description = "分类ID") @PathVariable Long id) {
        categoryService.online(id);
        return Result.success("分类已启用");
    }
}
