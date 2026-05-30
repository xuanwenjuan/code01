package com.cosmetics.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.cosmetics.common.ResultCode;
import com.cosmetics.entity.ProductCategory;
import com.cosmetics.exception.BusinessException;
import com.cosmetics.mapper.ProductCategoryMapper;
import com.cosmetics.service.ProductCategoryService;
import com.cosmetics.vo.CategoryTreeVO;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductCategoryServiceImpl implements ProductCategoryService {

    private final ProductCategoryMapper categoryMapper;
    private final RedisTemplate<String, Object> redisTemplate;

    private static final String CATEGORY_CACHE_KEY = "product:category:tree";
    private static final long CACHE_EXPIRE_HOURS = 24;

    @Override
    @SuppressWarnings("unchecked")
    public List<CategoryTreeVO> getCategoryTree() {
        try {
            Object cached = redisTemplate.opsForValue().get(CATEGORY_CACHE_KEY);
            if (cached != null) {
                return (List<CategoryTreeVO>) cached;
            }
        } catch (Exception e) {
        }

        List<ProductCategory> allCategories = categoryMapper.selectList(
                new LambdaQueryWrapper<ProductCategory>()
                        .orderByAsc(ProductCategory::getSortOrder)
        );

        List<CategoryTreeVO> allVOs = allCategories.stream()
                .map(this::convertToVO)
                .collect(Collectors.toList());

        Map<Long, List<CategoryTreeVO>> parentChildrenMap = new HashMap<>();
        for (CategoryTreeVO vo : allVOs) {
            Long parentId = vo.getParentId() == null ? 0L : vo.getParentId();
            parentChildrenMap.computeIfAbsent(parentId, k -> new ArrayList<>()).add(vo);
        }

        List<CategoryTreeVO> rootCategories = parentChildrenMap.getOrDefault(0L, new ArrayList<>());
        buildTree(rootCategories, parentChildrenMap);

        try {
            redisTemplate.opsForValue().set(CATEGORY_CACHE_KEY, rootCategories, CACHE_EXPIRE_HOURS, TimeUnit.HOURS);
        } catch (Exception e) {
        }

        return rootCategories;
    }

    private void buildTree(List<CategoryTreeVO> parents, Map<Long, List<CategoryTreeVO>> parentChildrenMap) {
        for (CategoryTreeVO parent : parents) {
            List<CategoryTreeVO> children = parentChildrenMap.getOrDefault(parent.getId(), new ArrayList<>());
            parent.setChildren(children);
            if (!children.isEmpty()) {
                buildTree(children, parentChildrenMap);
            }
        }
    }

    private CategoryTreeVO convertToVO(ProductCategory category) {
        CategoryTreeVO vo = new CategoryTreeVO();
        BeanUtils.copyProperties(category, vo);
        return vo;
    }

    @Override
    public ProductCategory getById(Long id) {
        return categoryMapper.selectById(id);
    }

    @Override
    public void add(ProductCategory category) {
        if (category.getParentId() == null) {
            category.setParentId(0L);
            category.setLevel(1);
        } else {
            ProductCategory parent = categoryMapper.selectById(category.getParentId());
            if (parent == null) {
                throw new BusinessException(ResultCode.DATA_NOT_FOUND.getCode(), "父分类不存在");
            }
            category.setLevel(parent.getLevel() + 1);
        }
        categoryMapper.insert(category);
        clearCache();
    }

    @Override
    public void update(ProductCategory category) {
        ProductCategory exist = categoryMapper.selectById(category.getId());
        if (exist == null) {
            throw new BusinessException(ResultCode.DATA_NOT_FOUND);
        }
        categoryMapper.updateById(category);
        clearCache();
    }

    @Override
    public void delete(Long id) {
        Long childCount = categoryMapper.selectCount(
                new LambdaQueryWrapper<ProductCategory>()
                        .eq(ProductCategory::getParentId, id)
        );
        if (childCount > 0) {
            throw new BusinessException("该分类下存在子分类，无法删除");
        }
        categoryMapper.deleteById(id);
        clearCache();
    }

    private void clearCache() {
        try {
            redisTemplate.delete(CATEGORY_CACHE_KEY);
        } catch (Exception e) {
        }
    }
}
