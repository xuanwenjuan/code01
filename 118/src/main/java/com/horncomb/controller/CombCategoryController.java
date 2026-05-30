package com.horncomb.controller;

import com.horncomb.annotation.RequireRole;
import com.horncomb.common.Constants;
import com.horncomb.common.Result;
import com.horncomb.dto.CategoryDTO;
import com.horncomb.service.CombCategoryService;
import com.horncomb.vo.CombCategoryVO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/category")
@RequiredArgsConstructor
public class CombCategoryController {

    private final CombCategoryService combCategoryService;

    @GetMapping("/tree")
    public Result<List<CombCategoryVO>> treeList() {
        List<CombCategoryVO> list = combCategoryService.treeList();
        return Result.success(list);
    }

    @GetMapping("/hot")
    public Result<List<CombCategoryVO>> getHotCategories() {
        List<CombCategoryVO> list = combCategoryService.getHotCategories();
        return Result.success(list);
    }

    @GetMapping("/{id}")
    public Result<CombCategoryVO> getById(@PathVariable Long id) {
        CombCategoryVO vo = combCategoryService.getById(id);
        return Result.success(vo);
    }

    @PostMapping
    @RequireRole({Constants.ROLE_ADMIN, Constants.ROLE_WAREHOUSE_MANAGER})
    public Result<Void> create(@Valid @RequestBody CategoryDTO dto) {
        combCategoryService.create(dto);
        return Result.success("创建成功", null);
    }

    @PutMapping
    @RequireRole({Constants.ROLE_ADMIN, Constants.ROLE_WAREHOUSE_MANAGER})
    public Result<Void> update(@Valid @RequestBody CategoryDTO dto) {
        combCategoryService.update(dto);
        return Result.success("更新成功", null);
    }

    @PutMapping("/{id}/offline")
    @RequireRole({Constants.ROLE_ADMIN, Constants.ROLE_WAREHOUSE_MANAGER})
    public Result<Void> offline(@PathVariable Long id) {
        combCategoryService.offline(id);
        return Result.success("下架成功", null);
    }

    @DeleteMapping("/{id}")
    @RequireRole({Constants.ROLE_ADMIN, Constants.ROLE_WAREHOUSE_MANAGER})
    public Result<Void> delete(@PathVariable Long id) {
        combCategoryService.delete(id);
        return Result.success("删除成功", null);
    }
}
