package com.textile.production.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.textile.production.common.Result;
import com.textile.production.common.ResultCode;
import com.textile.production.dto.FabricCategoryDTO;
import com.textile.production.entity.FabricCategory;
import com.textile.production.exception.BusinessException;
import com.textile.production.mapper.FabricCategoryMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FabricCategoryService extends ServiceImpl<FabricCategoryMapper, FabricCategory> {

    public Result<FabricCategory> addCategory(FabricCategoryDTO dto) {
        LambdaQueryWrapper<FabricCategory> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(FabricCategory::getName, dto.getName())
                .eq(FabricCategory::getParentId, dto.getParentId());
        if (exists(wrapper)) {
            throw new BusinessException(ResultCode.DATA_ALREADY_EXIST.getCode(), "同级分类下已存在该名称");
        }

        FabricCategory category = new FabricCategory();
        category.setName(dto.getName());
        category.setParentId(dto.getParentId());
        category.setLevel(dto.getLevel());
        category.setPriority(dto.getPriority());
        category.setStatus(dto.getStatus());
        category.setDescription(dto.getDescription());
        save(category);

        return Result.success("添加成功", category);
    }

    public Result<FabricCategory> updateCategory(FabricCategoryDTO dto) {
        FabricCategory category = getById(dto.getId());
        if (category == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }

        LambdaQueryWrapper<FabricCategory> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(FabricCategory::getName, dto.getName())
                .eq(FabricCategory::getParentId, dto.getParentId())
                .ne(FabricCategory::getId, dto.getId());
        if (exists(wrapper)) {
            throw new BusinessException(ResultCode.DATA_ALREADY_EXIST.getCode(), "同级分类下已存在该名称");
        }

        category.setName(dto.getName());
        category.setPriority(dto.getPriority());
        category.setStatus(dto.getStatus());
        category.setDescription(dto.getDescription());
        updateById(category);

        return Result.success("更新成功", category);
    }

    public Result<Void> deleteCategory(Long id) {
        FabricCategory category = getById(id);
        if (category == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }

        LambdaQueryWrapper<FabricCategory> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(FabricCategory::getParentId, id);
        if (exists(wrapper)) {
            throw new BusinessException(ResultCode.DATA_IN_USE.getCode(), "该分类下存在子分类，无法删除");
        }

        removeById(id);
        return Result.success("删除成功");
    }

    public Result<Void> updatePriority(Long id, Integer priority) {
        FabricCategory category = getById(id);
        if (category == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }
        category.setPriority(priority);
        updateById(category);
        return Result.success("优先级更新成功");
    }

    public Result<Void> toggleStatus(Long id) {
        FabricCategory category = getById(id);
        if (category == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }
        category.setStatus(category.getStatus() == 1 ? 0 : 1);
        updateById(category);
        return Result.success(category.getStatus() == 1 ? "已上架" : "已下架停产");
    }

    public Result<List<FabricCategory>> getTree() {
        List<FabricCategory> allCategories = list(new LambdaQueryWrapper<FabricCategory>()
                .orderByAsc(FabricCategory::getPriority)
                .orderByAsc(FabricCategory::getId));

        Map<Long, List<FabricCategory>> parentMap = allCategories.stream()
                .collect(Collectors.groupingBy(FabricCategory::getParentId));

        allCategories.forEach(category -> {
            List<FabricCategory> children = parentMap.getOrDefault(category.getId(), new ArrayList<>());
            category.setChildren(children);
        });

        List<FabricCategory> tree = parentMap.getOrDefault(0L, new ArrayList<>());
        return Result.success(tree);
    }

    public Result<List<FabricCategory>> getByParentId(Long parentId) {
        LambdaQueryWrapper<FabricCategory> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(FabricCategory::getParentId, parentId)
                .orderByDesc(FabricCategory::getPriority)
                .orderByAsc(FabricCategory::getId);
        return Result.success(list(wrapper));
    }

    public Result<FabricCategory> getCategoryById(Long id) {
        FabricCategory category = getById(id);
        if (category == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }
        return Result.success(category);
    }
}
