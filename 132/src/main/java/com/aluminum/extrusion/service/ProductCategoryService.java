package com.aluminum.extrusion.service;

import com.alibaba.fastjson2.JSON;
import com.aluminum.extrusion.entity.ProductCategory;
import com.aluminum.extrusion.exception.BusinessException;
import com.aluminum.extrusion.mapper.ProductCategoryMapper;
import com.aluminum.extrusion.vo.CategoryTreeVO;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductCategoryService extends ServiceImpl<ProductCategoryMapper, ProductCategory> {

    private final StringRedisTemplate redisTemplate;
    private static final String CATEGORY_CACHE_KEY = "extrusion:category:tree";
    private static final String CATEGORY_STATUS_KEY = "extrusion:category:status:";

    @Transactional(rollbackFor = Exception.class)
    public void addCategory(ProductCategory category) {
        LambdaQueryWrapper<ProductCategory> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ProductCategory::getCategoryName, category.getCategoryName());
        wrapper.eq(ProductCategory::getParentId, category.getParentId());
        if (count(wrapper) > 0) {
            throw new BusinessException("同级类目下已存在该名称");
        }

        if (category.getParentId() == null || category.getParentId() == 0) {
            category.setParentId(0L);
            category.setLevel(1);
        } else {
            ProductCategory parent = getById(category.getParentId());
            if (parent == null) {
                throw new BusinessException("父级类目不存在");
            }
            if (parent.getStatus() == 0) {
                throw new BusinessException("父级类目已下线，不能新增子类目");
            }
            category.setLevel(parent.getLevel() + 1);
        }

        category.setStatus(1);
        save(category);
        clearCategoryCache();
    }

    @Transactional(rollbackFor = Exception.class)
    public void updateCategory(ProductCategory category) {
        ProductCategory existing = getById(category.getId());
        if (existing == null) {
            throw new BusinessException("类目不存在");
        }

        if (category.getParentId() != null && !category.getParentId().equals(existing.getParentId())) {
            if (category.getParentId() == 0) {
                category.setLevel(1);
            } else {
                ProductCategory parent = getById(category.getParentId());
                if (parent == null) {
                    throw new BusinessException("父级类目不存在");
                }
                if (parent.getStatus() == 0) {
                    throw new BusinessException("父级类目已下线，不能移动到该类目下");
                }
                category.setLevel(parent.getLevel() + 1);
            }
        }

        updateById(category);
        clearCategoryCache();
    }

    @Transactional(rollbackFor = Exception.class)
    public void offlineCategory(Long id) {
        ProductCategory category = getById(id);
        if (category == null) {
            throw new BusinessException("类目不存在");
        }

        LambdaQueryWrapper<ProductCategory> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ProductCategory::getParentId, id);
        wrapper.eq(ProductCategory::getStatus, 1);
        if (count(wrapper) > 0) {
            throw new BusinessException("该类目下存在启用的子类目，请先下线子类目");
        }

        category.setStatus(0);
        updateById(category);
        clearCategoryCache();
        redisTemplate.opsForValue().set(CATEGORY_STATUS_KEY + id, "0");
    }

    @Transactional(rollbackFor = Exception.class)
    public void updatePriority(Long id, Integer priority) {
        ProductCategory category = getById(id);
        if (category == null) {
            throw new BusinessException("类目不存在");
        }
        category.setPriority(priority);
        updateById(category);
        clearCategoryCache();
    }

    public List<CategoryTreeVO> getCategoryTree() {
        String cache = redisTemplate.opsForValue().get(CATEGORY_CACHE_KEY);
        if (cache != null) {
            return JSON.parseArray(cache, CategoryTreeVO.class);
        }

        LambdaQueryWrapper<ProductCategory> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ProductCategory::getStatus, 1);
        wrapper.orderByAsc(ProductCategory::getPriority);
        List<ProductCategory> allCategories = list(wrapper);

        List<CategoryTreeVO> rootNodes = buildTreeRecursive(allCategories, 0L);

        redisTemplate.opsForValue().set(CATEGORY_CACHE_KEY, JSON.toJSONString(rootNodes));
        return rootNodes;
    }

    private List<CategoryTreeVO> buildTreeRecursive(List<ProductCategory> allCategories, Long parentId) {
        List<CategoryTreeVO> result = new ArrayList<>();

        for (ProductCategory category : allCategories) {
            if (category.getParentId().equals(parentId)) {
                CategoryTreeVO vo = convertToVO(category);
                List<CategoryTreeVO> children = buildTreeRecursive(allCategories, category.getId());
                vo.setChildren(children);
                result.add(vo);
            }
        }

        return result;
    }

    public boolean isCategoryOnline(Long categoryId) {
        String status = redisTemplate.opsForValue().get(CATEGORY_STATUS_KEY + categoryId);
        if (status != null) {
            return "1".equals(status);
        }

        ProductCategory category = getById(categoryId);
        if (category == null) {
            return false;
        }

        redisTemplate.opsForValue().set(CATEGORY_STATUS_KEY + categoryId, category.getStatus().toString());
        return category.getStatus() == 1;
    }

    private void clearCategoryCache() {
        redisTemplate.delete(CATEGORY_CACHE_KEY);
        Set<String> keys = redisTemplate.keys(CATEGORY_STATUS_KEY + "*");
        if (keys != null && !keys.isEmpty()) {
            redisTemplate.delete(keys);
        }
    }

    private CategoryTreeVO convertToVO(ProductCategory category) {
        CategoryTreeVO vo = new CategoryTreeVO();
        BeanUtils.copyProperties(category, vo);
        return vo;
    }

    public List<ProductCategory> getOnlineCategoryList() {
        LambdaQueryWrapper<ProductCategory> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ProductCategory::getStatus, 1);
        wrapper.orderByAsc(ProductCategory::getPriority);
        return list(wrapper);
    }
}
