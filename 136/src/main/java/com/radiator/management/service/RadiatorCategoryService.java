package com.radiator.management.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.radiator.management.entity.RadiatorCategory;
import com.radiator.management.exception.BusinessException;
import com.radiator.management.mapper.RadiatorCategoryMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RadiatorCategoryService {

    private final RadiatorCategoryMapper categoryMapper;

    public void addCategory(RadiatorCategory category) {
        LambdaQueryWrapper<RadiatorCategory> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(RadiatorCategory::getCategoryCode, category.getCategoryCode());
        if (categoryMapper.selectCount(wrapper) > 0) {
            throw new BusinessException("分类编码已存在");
        }
        categoryMapper.insert(category);
    }

    public void updateCategory(RadiatorCategory category) {
        categoryMapper.updateById(category);
    }

    public void deleteCategory(Long id) {
        LambdaQueryWrapper<RadiatorCategory> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(RadiatorCategory::getParentId, id);
        if (categoryMapper.selectCount(wrapper) > 0) {
            throw new BusinessException("存在子分类，无法删除");
        }
        categoryMapper.deleteById(id);
    }

    public List<RadiatorCategory> getTree() {
        List<RadiatorCategory> allCategories = categoryMapper.selectList(
            new LambdaQueryWrapper<RadiatorCategory>()
                .orderByAsc(RadiatorCategory::getPriority)
        );
        return buildTree(allCategories, 0L);
    }

    private List<RadiatorCategory> buildTree(List<RadiatorCategory> allCategories, Long parentId) {
        return allCategories.stream()
                .filter(category -> parentId.equals(category.getParentId()))
                .peek(category -> category.setChildren(buildTree(allCategories, category.getId())))
                .collect(Collectors.toList());
    }

    public List<RadiatorCategory> getActiveCategories() {
        return categoryMapper.selectList(
            new LambdaQueryWrapper<RadiatorCategory>()
                .eq(RadiatorCategory::getStatus, 1)
                .orderByAsc(RadiatorCategory::getPriority)
        );
    }
}