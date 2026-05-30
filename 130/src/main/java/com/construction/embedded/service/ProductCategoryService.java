package com.construction.embedded.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.construction.embedded.entity.ProductCategory;
import com.construction.embedded.exception.BusinessException;
import com.construction.embedded.mapper.ProductCategoryMapper;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Slf4j
@Service
public class ProductCategoryService {

    private static final String CATEGORY_CACHE_KEY = "product:category:tree";
    private static final long CACHE_EXPIRE_HOURS = 24;

    @Autowired
    private ProductCategoryMapper productCategoryMapper;

    @Autowired
    private StringRedisTemplate stringRedisTemplate;

    @Autowired
    private ObjectMapper objectMapper;

    public List<ProductCategory> getCategoryTree() {
        String cached = stringRedisTemplate.opsForValue().get(CATEGORY_CACHE_KEY);
        if (cached != null) {
            try {
                return objectMapper.readValue(cached, 
                    objectMapper.getTypeFactory().constructCollectionType(List.class, ProductCategory.class));
            } catch (JsonProcessingException e) {
                log.warn("解析缓存分类数据失败", e);
            }
        }

        List<ProductCategory> allCategories = productCategoryMapper.selectList(
                new LambdaQueryWrapper<ProductCategory>()
                        .orderByAsc(ProductCategory::getSortOrder)
                        .orderByDesc(ProductCategory::getPriority)
        );
        
        List<ProductCategory> tree = buildTreeRecursive(allCategories, 0L);
        
        try {
            String json = objectMapper.writeValueAsString(tree);
            stringRedisTemplate.opsForValue().set(CATEGORY_CACHE_KEY, json, CACHE_EXPIRE_HOURS, TimeUnit.HOURS);
        } catch (JsonProcessingException e) {
            log.warn("缓存分类数据失败", e);
        }
        
        return tree;
    }

    private List<ProductCategory> buildTreeRecursive(List<ProductCategory> categories, Long parentId) {
        Map<Long, List<ProductCategory>> parentChildrenMap = categories.stream()
                .collect(Collectors.groupingBy(ProductCategory::getParentId));
        
        return buildTreeWithMap(parentChildrenMap, parentId);
    }

    private List<ProductCategory> buildTreeWithMap(Map<Long, List<ProductCategory>> parentChildrenMap, Long parentId) {
        List<ProductCategory> children = parentChildrenMap.getOrDefault(parentId, new ArrayList<>());
        for (ProductCategory child : children) {
            child.setChildren(buildTreeWithMap(parentChildrenMap, child.getId()));
        }
        return children;
    }

    public List<ProductCategory> getAvailableCategories() {
        List<ProductCategory> allCategories = productCategoryMapper.selectList(
                new LambdaQueryWrapper<ProductCategory>()
                        .eq(ProductCategory::getStatus, 1)
                        .orderByAsc(ProductCategory::getSortOrder)
                        .orderByDesc(ProductCategory::getPriority)
        );
        return buildTreeRecursive(allCategories, 0L);
    }

    public void validateCategoryAvailable(Long categoryId) {
        ProductCategory category = productCategoryMapper.selectById(categoryId);
        if (category == null) {
            throw new BusinessException("产品分类不存在");
        }
        if (category.getStatus() == 0) {
            throw new BusinessException("该产品款式已下线，无法下发工单");
        }
        
        ProductCategory parent = productCategoryMapper.selectById(category.getParentId());
        if (parent != null && parent.getStatus() == 0) {
            throw new BusinessException("所属上级分类已下线，无法下发工单");
        }
    }

    public void addCategory(ProductCategory category) {
        LambdaQueryWrapper<ProductCategory> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ProductCategory::getCategoryCode, category.getCategoryCode());
        if (productCategoryMapper.selectCount(wrapper) > 0) {
            throw new BusinessException("分类编码已存在");
        }
        category.setStatus(1);
        productCategoryMapper.insert(category);
        clearCache();
    }

    public void updateCategory(ProductCategory category) {
        ProductCategory existing = productCategoryMapper.selectById(category.getId());
        if (existing == null) {
            throw new BusinessException("分类不存在");
        }
        if (!existing.getCategoryCode().equals(category.getCategoryCode())) {
            LambdaQueryWrapper<ProductCategory> wrapper = new LambdaQueryWrapper<>();
            wrapper.eq(ProductCategory::getCategoryCode, category.getCategoryCode());
            if (productCategoryMapper.selectCount(wrapper) > 0) {
                throw new BusinessException("分类编码已存在");
            }
        }
        productCategoryMapper.updateById(category);
        clearCache();
    }

    public void offlineCategory(Long id) {
        ProductCategory category = productCategoryMapper.selectById(id);
        if (category == null) {
            throw new BusinessException("分类不存在");
        }
        category.setStatus(0);
        productCategoryMapper.updateById(category);
        clearCache();
    }

    public void onlineCategory(Long id) {
        ProductCategory category = productCategoryMapper.selectById(id);
        if (category == null) {
            throw new BusinessException("分类不存在");
        }
        category.setStatus(1);
        productCategoryMapper.updateById(category);
        clearCache();
    }

    public void deleteCategory(Long id) {
        LambdaQueryWrapper<ProductCategory> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ProductCategory::getParentId, id);
        if (productCategoryMapper.selectCount(wrapper) > 0) {
            throw new BusinessException("存在子分类，无法删除");
        }
        productCategoryMapper.deleteById(id);
        clearCache();
    }

    public List<ProductCategory> getByType(String categoryType) {
        LambdaQueryWrapper<ProductCategory> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ProductCategory::getCategoryType, categoryType)
                .eq(ProductCategory::getStatus, 1)
                .orderByAsc(ProductCategory::getSortOrder);
        return productCategoryMapper.selectList(wrapper);
    }

    public ProductCategory getById(Long id) {
        return productCategoryMapper.selectById(id);
    }

    private void clearCache() {
        stringRedisTemplate.delete(CATEGORY_CACHE_KEY);
    }
}
