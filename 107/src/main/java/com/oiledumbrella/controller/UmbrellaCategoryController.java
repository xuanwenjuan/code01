package com.oiledumbrella.controller;

import com.oiledumbrella.common.Result;
import com.oiledumbrella.entity.UmbrellaCategory;
import com.oiledumbrella.service.UmbrellaCategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/category")
@RequiredArgsConstructor
public class UmbrellaCategoryController {

    private final UmbrellaCategoryService categoryService;

    @GetMapping("/tree")
    public Result<List<UmbrellaCategory>> tree() {
        List<UmbrellaCategory> tree = categoryService.tree();
        return Result.success(tree);
    }

    @PostMapping
    public Result<Void> add(@RequestBody UmbrellaCategory category) {
        categoryService.add(category);
        return Result.success("添加成功", null);
    }

    @PutMapping
    public Result<Void> update(@RequestBody UmbrellaCategory category) {
        categoryService.update(category);
        return Result.success("更新成功", null);
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        categoryService.delete(id);
        return Result.success("删除成功", null);
    }

    @PutMapping("/off-shelve/{id}")
    public Result<Void> offShelve(@PathVariable Long id) {
        categoryService.offShelve(id);
        return Result.success("下架成功", null);
    }

    @GetMapping("/level/{level}")
    public Result<List<UmbrellaCategory>> getByLevel(@PathVariable Integer level) {
        List<UmbrellaCategory> list = categoryService.getByLevel(level);
        return Result.success(list);
    }
}
