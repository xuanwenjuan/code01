package com.bearing.production.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.bearing.production.entity.BearingCategory;
import com.bearing.production.exception.BusinessException;
import com.bearing.production.mapper.BearingCategoryMapper;
import com.bearing.production.util.RedisUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class BearingCategoryService {

    private final BearingCategoryMapper categoryMapper;
    private final RedisUtil redisUtil;

    private static final String CATEGORY_TREE_KEY = "bearing:category:tree";
    private static final String CATEGORY_ACTIVE_KEY = "bearing:category:active:";

    @CacheEvict(value = "categoryCache", allEntries = true)
    public void addCategory(BearingCategory category) {
        if (category.getParentId() == null) {
            category.setParentId(0L);
            category.setLevel(1);
        } else {
            BearingCategory parent = categoryMapper.selectById(category.getParentId());
            if (parent == null) {
                throw new BusinessException("父分类不存在");
            }
            if (parent.getStatus() == 0) {
                throw new BusinessException("父分类已下线，无法添加子分类");
            }
            category.setLevel(parent.getLevel() + 1);
        }

        String categoryCode = generateCategoryCode(category.getParentId());
        category.setCategoryCode(categoryCode);
        category.setStatus(1);

        if (category.getSort() == null) {
            category.setSort(0);
        }
        if (category.getPriority() == null) {
            category.setPriority(0);
        }

        categoryMapper.insert(category);
        clearCategoryCache();
    }

    @CacheEvict(value = "categoryCache", allEntries = true)
    public void updateCategory(BearingCategory category) {
        BearingCategory exist = categoryMapper.selectById(category.getId());
        if (exist == null) {
            throw new BusinessException("分类不存在");
        }
        categoryMapper.updateById(category);
        clearCategoryCache();
    }

    @CacheEvict(value = "categoryCache", allEntries = true)
    public void deleteCategory(Long id) {
        LambdaQueryWrapper<BearingCategory> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(BearingCategory::getParentId, id);
        if (categoryMapper.selectCount(wrapper) > 0) {
            throw new BusinessException("存在子分类，无法删除");
        }
        categoryMapper.deleteById(id);
        clearCategoryCache();
    }

    @CacheEvict(value = "categoryCache", allEntries = true)
    public void offlineCategory(Long id) {
        BearingCategory category = new BearingCategory();
        category.setId(id);
        category.setStatus(0);
        categoryMapper.updateById(category);
        
        offlineChildrenCategories(id);
        clearCategoryCache();
    }

    private void offlineChildrenCategories(Long parentId) {
        LambdaQueryWrapper<BearingCategory> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(BearingCategory::getParentId, parentId);
        List<BearingCategory> children = categoryMapper.selectList(wrapper);
        
        for (BearingCategory child : children) {
            child.setStatus(0);
            categoryMapper.updateById(child);
            offlineChildrenCategories(child.getId());
        }
    }

    @CacheEvict(value = "categoryCache", allEntries = true)
    public void updatePriority(Long id, Integer priority) {
        BearingCategory category = new BearingCategory();
        category.setId(id);
        category.setPriority(priority);
        categoryMapper.updateById(category);
        clearCategoryCache();
    }

    @Cacheable(value = "categoryCache", key = "'tree'")
    public List<BearingCategory> getTree() {
        List<BearingCategory> allCategories = categoryMapper.selectList(
                new LambdaQueryWrapper<BearingCategory>()
                        .orderByAsc(BearingCategory::getSort)
                        .orderByDesc(BearingCategory::getPriority)
        );

        return buildTreeRecursive(allCategories, 0L);
    }

    private List<BearingCategory> buildTreeRecursive(List<BearingCategory> allCategories, Long parentId) {
        Map<Long, List<BearingCategory>> parentChildrenMap = allCategories.stream()
                .collect(Collectors.groupingBy(BearingCategory::getParentId));

        return buildTreeHelper(parentChildrenMap, parentId);
    }

    private List<BearingCategory> buildTreeHelper(Map<Long, List<BearingCategory>> parentChildrenMap, Long parentId) {
        List<BearingCategory> result = new ArrayList<>();
        List<BearingCategory> children = parentChildrenMap.get(parentId);
        
        if (children != null) {
            for (BearingCategory category : children) {
                category.setChildren(buildTreeHelper(parentChildrenMap, category.getId()));
                result.add(category);
            }
        }
        return result;
    }

    @Cacheable(value = "categoryCache", key = "'level:' + #level")
    public List<BearingCategory> getByLevel(Integer level) {
        LambdaQueryWrapper<BearingCategory> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(BearingCategory::getLevel, level)
                .eq(BearingCategory::getStatus, 1)
                .orderByAsc(BearingCategory::getSort)
                .orderByDesc(BearingCategory::getPriority);
        return categoryMapper.selectList(wrapper);
    }

    public List<BearingCategory> getActiveCategories() {
        LambdaQueryWrapper<BearingCategory> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(BearingCategory::getStatus, 1)
                .orderByAsc(BearingCategory::getSort)
                .orderByDesc(BearingCategory::getPriority);
        return categoryMapper.selectList(wrapper);
    }

    public boolean isCategoryActive(Long categoryId) {
        String cacheKey = CATEGORY_ACTIVE_KEY + categoryId;
        
        if (redisUtil.hasKey(cacheKey)) {
            return (Boolean) redisUtil.get(cacheKey);
        }
        
        BearingCategory category = categoryMapper.selectById(categoryId);
        boolean isActive = category != null && category.getStatus() == 1;
        
        redisUtil.set(cacheKey, isActive, 30, TimeUnit.MINUTES);
        return isActive;
    }

    public BearingCategory getById(Long id) {
        return categoryMapper.selectById(id);
    }

    private String generateCategoryCode(Long parentId) {
        String prefix = "BC";
        if (parentId != 0) {
            BearingCategory parent = categoryMapper.selectById(parentId);
            if (parent != null && parent.getCategoryCode() != null) {
                prefix = parent.getCategoryCode();
            }
        }

        LambdaQueryWrapper<BearingCategory> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(BearingCategory::getParentId, parentId);
        Long count = categoryMapper.selectCount(wrapper);

        return prefix + String.format("%03d", count + 1);
    }

    private void clearCategoryCache() {
        redisUtil.deleteByPrefix("bearing:category:");
    }
}
