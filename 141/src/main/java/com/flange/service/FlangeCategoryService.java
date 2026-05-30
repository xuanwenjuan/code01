package com.flange.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.flange.dto.CategoryDto;
import com.flange.entity.FlangeCategory;
import com.flange.exception.BusinessException;
import com.flange.mapper.FlangeCategoryMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FlangeCategoryService {

    private final FlangeCategoryMapper categoryMapper;

    public List<FlangeCategory> getCategoryTree() {
        List<FlangeCategory> allCategories = categoryMapper.selectList(
            new LambdaQueryWrapper<FlangeCategory>()
                .orderByAsc(FlangeCategory::getPriority)
        );
        return buildTree(allCategories, 0L);
    }

    private List<FlangeCategory> buildTree(List<FlangeCategory> categories, Long parentId) {
        return categories.stream()
                .filter(cat -> cat.getParentId().equals(parentId))
                .peek(cat -> cat.setChildren(buildTree(categories, cat.getId())))
                .collect(Collectors.toList());
    }

    @Transactional(rollbackFor = Exception.class)
    public void addCategory(CategoryDto dto) {
        LambdaQueryWrapper<FlangeCategory> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(FlangeCategory::getCategoryCode, dto.getCategoryCode());
        if (categoryMapper.selectCount(wrapper) > 0) {
            throw new BusinessException("分类编码已存在");
        }

        FlangeCategory category = new FlangeCategory();
        BeanUtils.copyProperties(dto, category);
        categoryMapper.insert(category);
    }

    @Transactional(rollbackFor = Exception.class)
    public void updateCategory(CategoryDto dto) {
        FlangeCategory category = categoryMapper.selectById(dto.getId());
        if (category == null) {
            throw new BusinessException("分类不存在");
        }

        LambdaQueryWrapper<FlangeCategory> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(FlangeCategory::getCategoryCode, dto.getCategoryCode())
               .ne(FlangeCategory::getId, dto.getId());
        if (categoryMapper.selectCount(wrapper) > 0) {
            throw new BusinessException("分类编码已存在");
        }

        BeanUtils.copyProperties(dto, category);
        categoryMapper.updateById(category);
    }

    @Transactional(rollbackFor = Exception.class)
    public void deleteCategory(Long id) {
        LambdaQueryWrapper<FlangeCategory> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(FlangeCategory::getParentId, id);
        if (categoryMapper.selectCount(wrapper) > 0) {
            throw new BusinessException("该分类下存在子分类，无法删除");
        }
        categoryMapper.deleteById(id);
    }

    public FlangeCategory getCategoryById(Long id) {
        return categoryMapper.selectById(id);
    }

    public List<FlangeCategory> getChildCategories(Long parentId) {
        LambdaQueryWrapper<FlangeCategory> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(FlangeCategory::getParentId, parentId)
               .orderByAsc(FlangeCategory::getPriority);
        return categoryMapper.selectList(wrapper);
    }
}
