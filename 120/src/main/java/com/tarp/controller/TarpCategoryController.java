package com.tarp.controller;

import com.tarp.annotation.OperationLog;
import com.tarp.annotation.RequireRole;
import com.tarp.common.RoleConstants;
import com.tarp.dto.TarpCategoryDTO;
import com.tarp.entity.TarpCategory;
import com.tarp.service.TarpCategoryService;
import com.tarp.vo.ResultVO;
import com.tarp.vo.TarpCategoryVO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/category")
@RequiredArgsConstructor
public class TarpCategoryController {

    private final TarpCategoryService categoryService;

    @GetMapping("/tree")
    public ResultVO<List<TarpCategoryVO>> treeList() {
        return ResultVO.success(categoryService.treeList());
    }

    @GetMapping("/enabled")
    public ResultVO<List<TarpCategoryVO>> enabledList() {
        return ResultVO.success(categoryService.getEnabledCategories());
    }

    @GetMapping("/hot")
    public ResultVO<List<TarpCategoryVO>> hotList() {
        return ResultVO.success(categoryService.getHotCategories());
    }

    @PostMapping
    @OperationLog("新增篷布分类")
    @RequireRole({RoleConstants.ROLE_ADMIN, RoleConstants.ROLE_WAREHOUSE})
    public ResultVO<Void> addCategory(@Valid @RequestBody TarpCategoryDTO dto) {
        TarpCategory category = new TarpCategory();
        BeanUtils.copyProperties(dto, category);
        categoryService.addCategory(category);
        return ResultVO.success();
    }

    @PutMapping
    @OperationLog("修改篷布分类")
    @RequireRole({RoleConstants.ROLE_ADMIN, RoleConstants.ROLE_WAREHOUSE})
    public ResultVO<Void> updateCategory(@Valid @RequestBody TarpCategoryDTO dto) {
        TarpCategory category = new TarpCategory();
        BeanUtils.copyProperties(dto, category);
        categoryService.updateCategory(category);
        return ResultVO.success();
    }

    @DeleteMapping("/{id}")
    @OperationLog("删除篷布分类")
    @RequireRole({RoleConstants.ROLE_ADMIN, RoleConstants.ROLE_WAREHOUSE})
    public ResultVO<Void> deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return ResultVO.success();
    }

    @PutMapping("/sort")
    @OperationLog("批量调整分类排序")
    @RequireRole({RoleConstants.ROLE_ADMIN, RoleConstants.ROLE_WAREHOUSE})
    public ResultVO<Void> batchUpdateSort(@RequestBody List<TarpCategory> categories) {
        categoryService.batchUpdateSort(categories);
        return ResultVO.success();
    }
}
