package com.spring.manufacturing.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.spring.manufacturing.entity.SpringCategory;
import com.spring.manufacturing.exception.BusinessException;
import com.spring.manufacturing.mapper.SpringCategoryMapper;
import com.spring.manufacturing.service.SpringCategoryService;
import com.spring.manufacturing.vo.CategoryTreeVO;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SpringCategoryServiceImpl extends ServiceImpl<SpringCategoryMapper, SpringCategory> implements SpringCategoryService {

    private static final String CATEGORY_TREE_CACHE_KEY = "category:tree";
    private static final String CATEGORY_STATUS_CACHE_KEY = "category:status:";

    private final RedisTemplate<String, Object> redisTemplate;

    @Override
    @SuppressWarnings("unchecked")
    public List<CategoryTreeVO> getCategoryTree() {
        Object cachedTree = redisTemplate.opsForValue().get(CATEGORY_TREE_CACHE_KEY);
        if (cachedTree != null) {
            return (List<CategoryTreeVO>) cachedTree;
        }

        List<SpringCategory> allCategories = list(new LambdaQueryWrapper<SpringCategory>()
                .orderByDesc(SpringCategory::getPriority)
                .orderByAsc(SpringCategory::getCreateTime));

        Map<Long, List<SpringCategory>> childrenMap = allCategories.stream()
                .filter(c -> c.getParentId() != null && c.getParentId() != 0)
                .collect(Collectors.groupingBy(SpringCategory::getParentId));

        List<CategoryTreeVO> rootCategories = allCategories.stream()
                .filter(c -> c.getParentId() == null || c.getParentId() == 0)
                .map(this::convertToVO)
                .collect(Collectors.toList());

        buildTreeRecursive(rootCategories, childrenMap);

        redisTemplate.opsForValue().set(CATEGORY_TREE_CACHE_KEY, rootCategories, 1, TimeUnit.HOURS);

        return rootCategories;
    }

    @Override
    public void addCategory(SpringCategory category) {
        if (category.getParentId() == null) {
            category.setParentId(0L);
        }
        if (category.getStatus() == null) {
            category.setStatus(1);
        }
        if (category.getPriority() == null) {
            category.setPriority(0);
        }
        save(category);
        clearCategoryCache();
    }

    @Override
    public void updateCategory(SpringCategory category) {
        updateById(category);
        clearCategoryCache();
        updateCategoryStatusCache(category.getId(), category.getStatus());
    }

    @Override
    public void deleteCategory(Long id) {
        Long childCount = count(new LambdaQueryWrapper<SpringCategory>().eq(SpringCategory::getParentId, id));
        if (childCount > 0) {
            throw new BusinessException("存在子分类，无法删除");
        }
        removeById(id);
        clearCategoryCache();
    }

    @Override
    public void offlineCategory(Long id) {
        SpringCategory category = getById(id);
        if (category == null) {
            throw new BusinessException("分类不存在");
        }
        category.setStatus(0);
        updateById(category);
        clearCategoryCache();
        updateCategoryStatusCache(id, 0);
    }

    @Override
    public boolean isCategoryOffline(Long categoryId) {
        String cacheKey = CATEGORY_STATUS_CACHE_KEY + categoryId;
        Object cachedStatus = redisTemplate.opsForValue().get(cacheKey);

        if (cachedStatus != null) {
            return Integer.valueOf(cachedStatus.toString()) == 0;
        }

        SpringCategory category = getById(categoryId);
        if (category == null) {
            return true;
        }

        updateCategoryStatusCache(categoryId, category.getStatus());
        return category.getStatus() == 0;
    }

    private void buildTreeRecursive(List<CategoryTreeVO> parentList, Map<Long, List<SpringCategory>> childrenMap) {
        for (CategoryTreeVO parent : parentList) {
            List<SpringCategory> children = childrenMap.get(parent.getId());
            if (children != null && !children.isEmpty()) {
                List<CategoryTreeVO> childVOs = children.stream()
                        .map(this::convertToVO)
                        .collect(Collectors.toList());
                parent.setChildren(childVOs);
                buildTreeRecursive(childVOs, childrenMap);
            } else {
                parent.setChildren(new ArrayList<>());
            }
        }
    }

    private CategoryTreeVO convertToVO(SpringCategory category) {
        CategoryTreeVO vo = new CategoryTreeVO();
        BeanUtils.copyProperties(category, vo);
        return vo;
    }

    private void clearCategoryCache() {
        redisTemplate.delete(CATEGORY_TREE_CACHE_KEY);
    }

    private void updateCategoryStatusCache(Long categoryId, Integer status) {
        String cacheKey = CATEGORY_STATUS_CACHE_KEY + categoryId;
        redisTemplate.opsForValue().set(cacheKey, status, 1, TimeUnit.HOURS);
    }
}