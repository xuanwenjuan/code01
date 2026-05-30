package com.heritage.dye.controller;

import com.heritage.dye.common.Result;
import com.heritage.dye.dto.DyeCategoryDTO;
import com.heritage.dye.service.DyeCategoryService;
import com.heritage.dye.vo.DyeCategoryVO;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/dye-category")
public class DyeCategoryController {

    @Autowired
    private DyeCategoryService dyeCategoryService;

    @PostMapping
    public Result<Void> create(@RequestBody @Valid DyeCategoryDTO dto) {
        dyeCategoryService.create(dto);
        return Result.success();
    }

    @PutMapping
    public Result<Void> update(@RequestBody @Valid DyeCategoryDTO dto) {
        dyeCategoryService.update(dto);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        dyeCategoryService.delete(id);
        return Result.success();
    }

    @GetMapping("/{id}")
    public Result<DyeCategoryVO> getById(@PathVariable Long id) {
        return Result.success(dyeCategoryService.getById(id));
    }

    @GetMapping("/tree")
    public Result<List<DyeCategoryVO>> tree() {
        return Result.success(dyeCategoryService.tree());
    }

    @GetMapping("/hot/{categoryType}")
    public Result<List<DyeCategoryVO>> listByType(@PathVariable Integer categoryType) {
        return Result.success(dyeCategoryService.listByType(categoryType));
    }

    @GetMapping("/list")
    public Result<List<DyeCategoryVO>> listAllByType(
            @RequestParam(required = false) Integer categoryType,
            @RequestParam(required = false) String keyword) {
        return Result.success(dyeCategoryService.listAllByType(categoryType, keyword));
    }
}
