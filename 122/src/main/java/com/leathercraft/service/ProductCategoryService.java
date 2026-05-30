package com.leathercraft.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.leathercraft.entity.ProductCategory;
import com.leathercraft.exception.BusinessException;
import com.leathercraft.mapper.ProductCategoryMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductCategoryService {

    private final ProductCategoryMapper productCategoryMapper;
    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;

    private static final String HOT_CATEGORY_KEY = "hot:category";
    private static final String ALL_CATEGORY_KEY = "category:all";

    public List<ProductCategory> treeList() {
        try {
            String cacheData = redisTemplate.opsForValue().get(ALL_CATEGORY_KEY);
            if (cacheData != null) {
                return objectMapper.readValue(cacheData, new TypeReference<List<ProductCategory>>() {});
            }
        } catch (Exception e) {
        }

        List<ProductCategory> allList = productCategoryMapper.selectList(
                new LambdaQueryWrapper<ProductCategory>()
                        .orderByAsc(ProductCategory::getSortOrder)
        );

        List<ProductCategory> treeList = buildTreeRecursive(allList, 0L);

        try {
            redisTemplate.opsForValue().set(ALL_CATEGORY_KEY, objectMapper.writeValueAsString(treeList), 1, TimeUnit.HOURS);
        } catch (Exception e) {
        }

        return treeList;
    }

    private List<ProductCategory> buildTreeRecursive(List<ProductCategory> allList, Long parentId) {
        List<ProductCategory> treeList = new ArrayList<>();
        for (ProductCategory category : allList) {
            if (category.getParentId().equals(parentId)) {
                category.setChildren(buildTreeRecursive(allList, category.getId()));
                treeList.add(category);
            }
        }
        return treeList;
    }

    public List<ProductCategory> getHotCategories() {
        try {
            String cacheData = redisTemplate.opsForValue().get(HOT_CATEGORY_KEY);
            if (cacheData != null) {
                return objectMapper.readValue(cacheData, new TypeReference<List<ProductCategory>>() {});
            }
        } catch (Exception e) {
        }

        List<ProductCategory> hotCategories = productCategoryMapper.selectList(
                new LambdaQueryWrapper<ProductCategory>()
                        .eq(ProductCategory::getStatus, 1)
                        .orderByDesc(ProductCategory::getSortOrder)
                        .last("LIMIT 10")
        );

        try {
            redisTemplate.opsForValue().set(HOT_CATEGORY_KEY, objectMapper.writeValueAsString(hotCategories), 30, TimeUnit.MINUTES);
        } catch (Exception e) {
        }

        return hotCategories;
    }

    public boolean isCategoryStopped(Long categoryId) {
        if (categoryId == null) {
            return false;
        }
        ProductCategory category = productCategoryMapper.selectById(categoryId);
        return category != null && category.getStatus() == 0;
    }

    @Transactional(rollbackFor = Exception.class)
    public void add(ProductCategory category) {
        ProductCategory exist = productCategoryMapper.selectOne(
                new LambdaQueryWrapper<ProductCategory>()
                        .eq(ProductCategory::getCategoryCode, category.getCategoryCode())
        );
        if (exist != null) {
            throw new BusinessException("类目编码已存在");
        }
        productCategoryMapper.insert(category);
        clearCategoryCache();
    }

    @Transactional(rollbackFor = Exception.class)
    public void update(ProductCategory category) {
        productCategoryMapper.updateById(category);
        clearCategoryCache();
    }

    @Transactional(rollbackFor = Exception.class)
    public void stopProduction(Long id) {
        productCategoryMapper.update(
                new LambdaUpdateWrapper<ProductCategory>()
                        .eq(ProductCategory::getId, id)
                        .set(ProductCategory::getStatus, 0)
        );
        clearCategoryCache();
    }

    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        Long count = productCategoryMapper.selectCount(
                new LambdaQueryWrapper<ProductCategory>()
                        .eq(ProductCategory::getParentId, id)
        );
        if (count > 0) {
            throw new BusinessException("存在子类目，不能删除");
        }
        productCategoryMapper.deleteById(id);
        clearCategoryCache();
    }

    private void clearCategoryCache() {
        redisTemplate.delete(ALL_CATEGORY_KEY);
        redisTemplate.delete(HOT_CATEGORY_KEY);
    }

    public List<ProductCategory> listByParentId(Long parentId) {
        return productCategoryMapper.selectList(
                new LambdaQueryWrapper<ProductCategory>()
                        .eq(ProductCategory::getParentId, parentId)
                        .orderByAsc(ProductCategory::getSortOrder)
        );
    }

    public ProductCategory getCategoryById(Long id) {
        return productCategoryMapper.selectById(id);
    }
}
