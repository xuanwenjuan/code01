package com.evparts.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.evparts.common.ResultCode;
import com.evparts.dto.ProductCategoryDTO;
import com.evparts.entity.ProductCategory;
import com.evparts.entity.Product;
import com.evparts.exception.BusinessException;
import com.evparts.mapper.ProductCategoryMapper;
import com.evparts.mapper.ProductMapper;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;

@Service
public class ProductCategoryService {

    private static final String CACHE_KEY_TREE = "category:tree";
    private static final String CACHE_KEY_LIST = "category:list";
    private static final String CACHE_KEY_ID = "category:id:";
    private static final long CACHE_EXPIRE_HOURS = 24;

    @Autowired
    private ProductCategoryMapper categoryMapper;

    @Autowired
    private ProductMapper productMapper;

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    @SuppressWarnings("unchecked")
    public List<ProductCategory> getTree() {
        Object cached = redisTemplate.opsForValue().get(CACHE_KEY_TREE);
        if (cached != null) {
            return (List<ProductCategory>) cached;
        }

        List<ProductCategory> allCategories = categoryMapper.selectList(
                new LambdaQueryWrapper<ProductCategory>()
                        .orderByAsc(ProductCategory::getSortOrder)
        );
        List<ProductCategory> tree = buildTree(allCategories, 0L);
        redisTemplate.opsForValue().set(CACHE_KEY_TREE, tree, CACHE_EXPIRE_HOURS, TimeUnit.HOURS);
        return tree;
    }

    private List<ProductCategory> buildTree(List<ProductCategory> categories, Long parentId) {
        List<ProductCategory> tree = new ArrayList<>();
        for (ProductCategory category : categories) {
            if (category.getParentId().equals(parentId)) {
                category.setChildren(buildTree(categories, category.getId()));
                tree.add(category);
            }
        }
        return tree;
    }

    @SuppressWarnings("unchecked")
    public List<ProductCategory> getList() {
        Object cached = redisTemplate.opsForValue().get(CACHE_KEY_LIST);
        if (cached != null) {
            return (List<ProductCategory>) cached;
        }

        List<ProductCategory> list = categoryMapper.selectList(
                new LambdaQueryWrapper<ProductCategory>()
                        .orderByAsc(ProductCategory::getSortOrder)
        );
        redisTemplate.opsForValue().set(CACHE_KEY_LIST, list, CACHE_EXPIRE_HOURS, TimeUnit.HOURS);
        return list;
    }

    public ProductCategory getById(Long id) {
        String cacheKey = CACHE_KEY_ID + id;
        Object cached = redisTemplate.opsForValue().get(cacheKey);
        if (cached != null) {
            return (ProductCategory) cached;
        }

        ProductCategory category = categoryMapper.selectById(id);
        if (category == null) {
            throw new BusinessException(ResultCode.CATEGORY_NOT_EXIST);
        }
        redisTemplate.opsForValue().set(cacheKey, category, CACHE_EXPIRE_HOURS, TimeUnit.HOURS);
        return category;
    }

    @Transactional(rollbackFor = Exception.class)
    public void add(ProductCategoryDTO dto) {
        ProductCategory category = new ProductCategory();
        BeanUtils.copyProperties(dto, category);
        categoryMapper.insert(category);
        clearCache();
    }

    @Transactional(rollbackFor = Exception.class)
    public void update(ProductCategoryDTO dto) {
        ProductCategory category = categoryMapper.selectById(dto.getId());
        if (category == null) {
            throw new BusinessException(ResultCode.CATEGORY_NOT_EXIST);
        }
        BeanUtils.copyProperties(dto, category);
        categoryMapper.updateById(category);
        clearCache(dto.getId());
    }

    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        ProductCategory category = categoryMapper.selectById(id);
        if (category == null) {
            throw new BusinessException(ResultCode.CATEGORY_NOT_EXIST);
        }

        Long childCount = categoryMapper.selectCount(
                new LambdaQueryWrapper<ProductCategory>()
                        .eq(ProductCategory::getParentId, id)
        );
        if (childCount > 0) {
            throw new BusinessException(ResultCode.CATEGORY_HAS_CHILDREN);
        }

        Long productCount = productMapper.selectCount(
                new LambdaQueryWrapper<Product>()
                        .eq(Product::getCategoryId, id)
        );
        if (productCount > 0) {
            throw new BusinessException(ResultCode.CATEGORY_HAS_PRODUCTS);
        }

        categoryMapper.deleteById(id);
        clearCache(id);
    }

    private void clearCache() {
        redisTemplate.delete(CACHE_KEY_TREE);
        redisTemplate.delete(CACHE_KEY_LIST);
    }

    private void clearCache(Long id) {
        clearCache();
        if (id != null) {
            redisTemplate.delete(CACHE_KEY_ID + id);
        }
    }

    public List<ProductCategory> getByParentId(Long parentId) {
        return categoryMapper.selectList(
                new LambdaQueryWrapper<ProductCategory>()
                        .eq(ProductCategory::getParentId, parentId)
                        .orderByAsc(ProductCategory::getSortOrder)
        );
    }

}
