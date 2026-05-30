package com.gearbox.manage.controller;

import com.gearbox.manage.annotation.Log;
import com.gearbox.manage.common.Result;
import com.gearbox.manage.entity.GearboxCategory;
import com.gearbox.manage.service.GearboxCategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/category")
@RequiredArgsConstructor
public class GearboxCategoryController {

    private final GearboxCategoryService gearboxCategoryService;

    @GetMapping("/tree")
    public Result<List<GearboxCategory>> tree() {
        return Result.success(gearboxCategoryService.tree());
    }

    @GetMapping("/type/{categoryType}")
    public Result<List<GearboxCategory>> listByType(@PathVariable String categoryType) {
        return Result.success(gearboxCategoryService.listByType(categoryType));
    }

    @Log(module = "齿轮箱分类", operation = "新增分类")
    @PostMapping
    public Result<Void> add(@RequestBody GearboxCategory category) {
        return gearboxCategoryService.add(category) ? Result.success() : Result.error("新增失败");
    }

    @Log(module = "齿轮箱分类", operation = "更新分类")
    @PutMapping
    public Result<Void> update(@RequestBody GearboxCategory category) {
        return gearboxCategoryService.update(category) ? Result.success() : Result.error("更新失败");
    }

    @Log(module = "齿轮箱分类", operation = "下线分类")
    @PutMapping("/offline/{id}")
    public Result<Void> offline(@PathVariable Long id) {
        return gearboxCategoryService.offline(id) ? Result.success() : Result.error("下线失败");
    }

    @Log(module = "齿轮箱分类", operation = "更新优先级")
    @PutMapping("/priority/{id}")
    public Result<Void> updatePriority(@PathVariable Long id, @RequestParam Integer priority) {
        return gearboxCategoryService.updatePriority(id, priority) ? Result.success() : Result.error("更新失败");
    }
}
