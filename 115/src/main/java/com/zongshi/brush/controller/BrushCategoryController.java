package com.zongshi.brush.controller;

import com.zongshi.brush.annotation.OperationLog;
import com.zongshi.brush.common.Result;
import com.zongshi.brush.dto.BrushCategoryDTO;
import com.zongshi.brush.entity.BrushCategory;
import com.zongshi.brush.service.BrushCategoryService;
import com.zongshi.brush.vo.BrushCategoryTreeVO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/category")
@RequiredArgsConstructor
public class BrushCategoryController {

    private final BrushCategoryService brushCategoryService;

    @PostMapping
    @OperationLog(module = "毛笔品类类目", type = "新增", description = "新增类目")
    public Result<Long> addCategory(@Valid @RequestBody BrushCategoryDTO dto) {
        Long id = brushCategoryService.addCategory(dto);
        return Result.success("新增类目成功", id);
    }

    @PutMapping
    @OperationLog(module = "毛笔品类类目", type = "修改", description = "修改类目")
    public Result<Void> updateCategory(@Valid @RequestBody BrushCategoryDTO dto) {
        brushCategoryService.updateCategory(dto);
        return Result.success("修改类目成功");
    }

    @DeleteMapping("/{id}")
    @OperationLog(module = "毛笔品类类目", type = "删除", description = "删除类目")
    public Result<Void> deleteCategory(@PathVariable Long id) {
        brushCategoryService.deleteCategory(id);
        return Result.success("删除类目成功");
    }

    @GetMapping("/{id}")
    @OperationLog(module = "毛笔品类类目", type = "查询", description = "查询类目详情")
    public Result<BrushCategory> getCategoryById(@PathVariable Long id) {
        BrushCategory category = brushCategoryService.getCategoryById(id);
        return Result.success(category);
    }

    @GetMapping("/tree")
    @OperationLog(module = "毛笔品类类目", type = "查询", description = "查询类目树形结构")
    public Result<List<BrushCategoryTreeVO>> getCategoryTree(@RequestParam(required = false) Integer status) {
        List<BrushCategoryTreeVO> tree = brushCategoryService.getCategoryTree(status);
        return Result.success(tree);
    }

    @PutMapping("/offline/{id}")
    @OperationLog(module = "毛笔品类类目", type = "下架", description = "类目下架停产")
    public Result<Void> offlineCategory(@PathVariable Long id) {
        brushCategoryService.offlineCategory(id);
        return Result.success("类目下架成功");
    }

    @PutMapping("/sort")
    @OperationLog(module = "毛笔品类类目", type = "排序", description = "更新类目排序")
    public Result<Void> updateSort(@RequestBody List<BrushCategoryDTO> list) {
        brushCategoryService.updateSort(list);
        return Result.success("排序更新成功");
    }

    @GetMapping("/children/{id}")
    @OperationLog(module = "毛笔品类类目", type = "查询", description = "查询子类目列表")
    public Result<List<BrushCategory>> getChildrenById(@PathVariable Long id) {
        List<BrushCategory> children = brushCategoryService.getChildrenById(id);
        return Result.success(children);
    }

    @GetMapping("/hot")
    @OperationLog(module = "毛笔品类类目", type = "查询", description = "查询热门笔型分类")
    public Result<List<BrushCategory>> getHotCategories() {
        List<BrushCategory> list = brushCategoryService.getHotCategories();
        return Result.success(list);
    }

    @PutMapping("/{id}/view")
    @OperationLog(module = "毛笔品类类目", type = "更新", description = "增加浏览量")
    public Result<Void> incrementViewCount(@PathVariable Long id) {
        brushCategoryService.incrementViewCount(id);
        return Result.success("浏览量增加成功");
    }
}
