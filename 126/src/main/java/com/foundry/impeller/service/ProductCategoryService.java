package com.foundry.impeller.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.foundry.impeller.entity.ProductCategory;
import com.foundry.impeller.exception.BusinessException;
import com.foundry.impeller.mapper.ProductCategoryMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductCategoryService {

    private final ProductCategoryMapper categoryMapper;
    private final RedisTemplate<String, Object> redisTemplate;

    private static final String CATEGORY_CACHE_KEY = "product:category:tree";
    private static final String CATEGORY_MAP_KEY = "product:category:map";

    public List<ProductCategory> tree() {
        List<ProductCategory> cachedTree = (List<ProductCategory>) redisTemplate.opsForValue().get(CATEGORY_CACHE_KEY);
        if (cachedTree != null && !cachedTree.isEmpty()) {
            return cachedTree;
        }

        LambdaQueryWrapper<ProductCategory> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ProductCategory::getStatus, 1)
                .orderByAsc(ProductCategory::getSortOrder);
        List<ProductCategory> allCategories = categoryMapper.selectList(wrapper);

        Map<Long, String> categoryMap = allCategories.stream()
                .collect(Collectors.toMap(ProductCategory::getId, ProductCategory::getCategoryName));
        redisTemplate.opsForValue().set(CATEGORY_MAP_KEY, categoryMap);

        List<ProductCategory> tree = buildTreeRecursive(allCategories, 0L);
        redisTemplate.opsForValue().set(CATEGORY_CACHE_KEY, tree);
        return tree;
    }

    private List<ProductCategory> buildTreeRecursive(List<ProductCategory> allCategories, Long parentId) {
        List<ProductCategory> tree = new ArrayList<>();
        for (ProductCategory category : allCategories) {
            if (parentId.equals(category.getParentId())) {
                category.setChildren(buildTreeRecursive(allCategories, category.getId()));
                tree.add(category);
            }
        }
        return tree;
    }

    public List<ProductCategory> list() {
        LambdaQueryWrapper<ProductCategory> wrapper = new LambdaQueryWrapper<>();
        wrapper.orderByAsc(ProductCategory::getSortOrder);
        return categoryMapper.selectList(wrapper);
    }

    public ProductCategory getById(Long id) {
        return categoryMapper.selectById(id);
    }

    public void create(ProductCategory category) {
        LambdaQueryWrapper<ProductCategory> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ProductCategory::getCategoryCode, category.getCategoryCode());
        ProductCategory exist = categoryMapper.selectOne(wrapper);
        if (exist != null) {
            throw new BusinessException("分类编码已存在");
        }
        if (category.getParentId() == null) {
            category.setParentId(0L);
        }
        if (category.getSortOrder() == null) {
            category.setSortOrder(0);
        }
        if (category.getStatus() == null) {
            category.setStatus(1);
        }
        categoryMapper.insert(category);
        clearCache();
    }

    public void update(ProductCategory category) {
        categoryMapper.updateById(category);
        clearCache();
    }

    public void delete(Long id) {
        LambdaQueryWrapper<ProductCategory> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ProductCategory::getParentId, id);
        Long count = categoryMapper.selectCount(wrapper);
        if (count > 0) {
            throw new BusinessException("该分类下存在子分类，无法删除");
        }
        categoryMapper.deleteById(id);
        clearCache();
    }

    public void updateStatus(Long id, Integer status) {
        ProductCategory category = new ProductCategory();
        category.setId(id);
        category.setStatus(status);
        categoryMapper.updateById(category);
        clearCache();
    }

    public void checkCategoryAvailable(Long categoryId) {
        ProductCategory category = categoryMapper.selectById(categoryId);
        if (category == null) {
            throw new BusinessException("产品分类不存在");
        }
        if (category.getStatus() == 0) {
            throw new BusinessException("该产品分类已下架，无法创建工单");
        }
    }

    public String getCategoryName(Long categoryId) {
        Map<Long, String> categoryMap = (Map<Long, String>) redisTemplate.opsForValue().get(CATEGORY_MAP_KEY);
        if (categoryMap != null && categoryMap.containsKey(categoryId)) {
            return categoryMap.get(categoryId);
        }
        ProductCategory category = categoryMapper.selectById(categoryId);
        return category != null ? category.getCategoryName() : "";
    }

    private void clearCache() {
        redisTemplate.delete(CATEGORY_CACHE_KEY);
        redisTemplate.delete(CATEGORY_MAP_KEY);
    }
}
