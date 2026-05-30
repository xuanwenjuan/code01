package com.oiledumbrella.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.oiledumbrella.annotation.RequiresRole;
import com.oiledumbrella.common.Result;
import com.oiledumbrella.entity.UmbrellaStyle;
import com.oiledumbrella.service.UmbrellaStyleService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/style")
@RequiredArgsConstructor
public class UmbrellaStyleController {

    private final UmbrellaStyleService styleService;

    @GetMapping("/page")
    public Result<Page<UmbrellaStyle>> page(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String keyword) {
        Page<UmbrellaStyle> page = styleService.page(pageNum, pageSize, categoryId, keyword);
        return Result.success(page);
    }

    @GetMapping("/hot")
    public Result<List<UmbrellaStyle>> getHotStyles() {
        List<UmbrellaStyle> styles = styleService.getHotStyles();
        return Result.success(styles);
    }

    @PostMapping
    @RequiresRole({"ADMIN"})
    public Result<Void> add(@RequestBody UmbrellaStyle style) {
        styleService.add(style);
        return Result.success("添加成功", null);
    }

    @PutMapping
    @RequiresRole({"ADMIN"})
    public Result<Void> update(@RequestBody UmbrellaStyle style) {
        styleService.update(style);
        return Result.success("更新成功", null);
    }

    @DeleteMapping("/{id}")
    @RequiresRole({"ADMIN"})
    public Result<Void> delete(@PathVariable Long id) {
        styleService.delete(id);
        return Result.success("删除成功", null);
    }

    @PutMapping("/off-shelve/{id}")
    @RequiresRole({"ADMIN"})
    public Result<Void> offShelve(@PathVariable Long id) {
        styleService.offShelve(id);
        return Result.success("下架成功", null);
    }

    @GetMapping("/{id}")
    public Result<UmbrellaStyle> getById(@PathVariable Long id) {
        UmbrellaStyle style = styleService.getById(id);
        return Result.success(style);
    }
}
