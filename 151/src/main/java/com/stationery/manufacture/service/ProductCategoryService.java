package com.stationery.manufacture.service;

import com.alibaba.fastjson2.JSON;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.stationery.manufacture.common.BusinessException;
import com.stationery.manufacture.common.ErrorCode;
import com.stationery.manufacture.entity.ProductCategory;
import com.stationery.manufacture.mapper.ProductCategoryMapper;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
public class ProductCategoryService {

    private static final String CATEGORY_TREE_CACHE_KEY = "category:tree";
    private static final String CATEGORY_LIST_CACHE_PREFIX = "category:list:";
    private static final long CACHE_EXPIRE_HOURS = 2;

    private final ProductCategoryMapper categoryMapper;
    private final StringRedisTemplate redisTemplate;

    public ProductCategoryService(ProductCategoryMapper categoryMapper, StringRedisTemplate redisTemplate) {
        this.categoryMapper = categoryMapper;
        this.redisTemplate = redisTemplate;
    }

    @Transactional(rollbackFor = Exception.class)
    public void addCategory(ProductCategory category) {
        Long count = categoryMapper.selectCount(new LambdaQueryWrapper<ProductCategory>()
                .eq(ProductCategory::getCategoryCode, category.getCategoryCode()));
        if (count > 0) {
            throw new BusinessException(ErrorCode.DATA_EXISTS);
        }

        if (category.getParentId() == null) {
            category.setParentId(0L);
        }

        if (category.getParentId() != 0) {
            ProductCategory parent = categoryMapper.selectById(category.getParentId());
            if (parent == null) {
                throw new BusinessException("父分类不存在");
            }
            category.setLevel(parent.getLevel() + 1);
            category.setAncestors(parent.getAncestors() + "," + category.getParentId());
        } else {
            category.setLevel(1);
            category.setAncestors("0");
        }

        if (category.getSort() == null) {
            category.setSort(0);
        }
        if (category.getStatus() == null) {
            category.setStatus(1);
        }
        category.setCreateTime(LocalDateTime.now());
        category.setUpdateTime(LocalDateTime.now());
        categoryMapper.insert(category);
        clearCategoryCache();
    }

    @Transactional(rollbackFor = Exception.class)
    public void updateCategory(ProductCategory category) {
        ProductCategory exist = categoryMapper.selectById(category.getId());
        if (exist == null) {
            throw new BusinessException(ErrorCode.DATA_NOT_EXISTS);
        }

        if (!exist.getCategoryCode().equals(category.getCategoryCode())) {
            Long count = categoryMapper.selectCount(new LambdaQueryWrapper<ProductCategory>()
                    .eq(ProductCategory::getCategoryCode, category.getCategoryCode()));
            if (count > 0) {
                throw new BusinessException(ErrorCode.DATA_EXISTS);
            }
        }

        category.setUpdateTime(LocalDateTime.now());
        categoryMapper.updateById(category);
        clearCategoryCache();
    }

    @Transactional(rollbackFor = Exception.class)
    public void deleteCategory(Long id) {
        Long childCount = categoryMapper.selectCount(new LambdaQueryWrapper<ProductCategory>()
                .eq(ProductCategory::getParentId, id));
        if (childCount > 0) {
            throw new BusinessException("存在子分类，无法删除");
        }
        categoryMapper.deleteById(id);
        clearCategoryCache();
    }

    public ProductCategory getCategoryById(Long id) {
        return categoryMapper.selectById(id);
    }

    public List<ProductCategory> getCategoryTree() {
        String cacheKey = CATEGORY_TREE_CACHE_KEY;
        String cached = redisTemplate.opsForValue().get(cacheKey);
        if (StringUtils.hasText(cached)) {
            return JSON.parseArray(cached, ProductCategory.class);
        }

        List<ProductCategory> all = categoryMapper.selectList(new LambdaQueryWrapper<ProductCategory>()
                .orderByAsc(ProductCategory::getSort));
        List<ProductCategory> tree = buildTree(all, 0L);

        redisTemplate.opsForValue().set(cacheKey, JSON.toJSONString(tree),
                CACHE_EXPIRE_HOURS, TimeUnit.HOURS);
        return tree;
    }

    public List<ProductCategory> getCategoryList(Long parentId, String keyword) {
        String cacheKey = CATEGORY_LIST_CACHE_PREFIX + (parentId != null ? parentId : "all") +
                ":" + (keyword != null ? keyword : "");
        String cached = redisTemplate.opsForValue().get(cacheKey);
        if (StringUtils.hasText(cached)) {
            return JSON.parseArray(cached, ProductCategory.class);
        }

        LambdaQueryWrapper<ProductCategory> wrapper = new LambdaQueryWrapper<>();
        if (parentId != null) {
            wrapper.eq(ProductCategory::getParentId, parentId);
        }
        if (StringUtils.hasText(keyword)) {
            wrapper.like(ProductCategory::getCategoryName, keyword);
        }
        wrapper.orderByAsc(ProductCategory::getSort);
        List<ProductCategory> list = categoryMapper.selectList(wrapper);

        redisTemplate.opsForValue().set(cacheKey, JSON.toJSONString(list),
                CACHE_EXPIRE_HOURS, TimeUnit.HOURS);
        return list;
    }

    private void clearCategoryCache() {
        try {
            redisTemplate.delete(CATEGORY_TREE_CACHE_KEY);
            redisTemplate.delete(redisTemplate.keys(CATEGORY_LIST_CACHE_PREFIX + "*"));
        } catch (Exception e) {
        }
    }

    private List<ProductCategory> buildTree(List<ProductCategory> all, Long parentId) {
        List<ProductCategory> result = new ArrayList<>();
        Map<Long, List<ProductCategory>> childrenMap = all.stream()
                .collect(Collectors.groupingBy(ProductCategory::getParentId));

        for (ProductCategory category : all) {
            if (category.getParentId().equals(parentId)) {
                result.add(category);
                buildChildren(category, childrenMap);
            }
        }
        return result;
    }

    private void buildChildren(ProductCategory parent, Map<Long, List<ProductCategory>> childrenMap) {
        List<ProductCategory> children = childrenMap.get(parent.getId());
        if (children != null && !children.isEmpty()) {
            parent.setChildren(children);
            for (ProductCategory child : children) {
                buildChildren(child, childrenMap);
            }
        }
    }

    @Transactional(rollbackFor = Exception.class)
    public void updateStatus(Long id, Integer status) {
        categoryMapper.update(null, new LambdaUpdateWrapper<ProductCategory>()
                .eq(ProductCategory::getId, id)
                .set(ProductCategory::getStatus, status)
                .set(ProductCategory::getUpdateTime, LocalDateTime.now()));
        clearCategoryCache();
    }
}
