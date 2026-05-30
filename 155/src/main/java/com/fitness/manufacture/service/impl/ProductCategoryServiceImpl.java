package com.fitness.manufacture.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.fitness.manufacture.common.BusinessException;
import com.fitness.manufacture.common.ResultCode;
import com.fitness.manufacture.dto.ProductCategoryDTO;
import com.fitness.manufacture.entity.Product;
import com.fitness.manufacture.entity.ProductCategory;
import com.fitness.manufacture.mapper.ProductCategoryMapper;
import com.fitness.manufacture.mapper.ProductMapper;
import com.fitness.manufacture.service.ProductCategoryService;
import com.fitness.manufacture.vo.CategoryTreeVO;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import org.springframework.beans.BeanUtils;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductCategoryServiceImpl implements ProductCategoryService {

    private final ProductCategoryMapper productCategoryMapper;
    private final ProductMapper productMapper;
    private final RedisTemplate<String, Object> redisTemplate;
    private final ObjectMapper objectMapper;

    private static final String CATEGORY_TREE_CACHE_KEY = "product:category:tree";
    private static final String CATEGORY_LIST_CACHE_KEY = "product:category:list";
    private static final long CACHE_EXPIRE_TIME = 2;

    @Override
    public void saveCategory(ProductCategoryDTO dto) {
        ProductCategory exist = productCategoryMapper.selectOne(new LambdaQueryWrapper<ProductCategory>()
                .eq(ProductCategory::getCategoryCode, dto.getCategoryCode()));
        if (exist != null) {
            throw new BusinessException(ResultCode.DATA_EXIST, "分类编码已存在");
        }

        ProductCategory category = new ProductCategory();
        BeanUtils.copyProperties(dto, category);
        if (dto.getParentId() == null) {
            category.setParentId(0L);
            category.setLevel(1);
        }
        productCategoryMapper.insert(category);
        clearCategoryCache();
    }

    @Override
    public void updateCategory(ProductCategoryDTO dto) {
        ProductCategory category = productCategoryMapper.selectById(dto.getId());
        if (category == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }

        ProductCategory exist = productCategoryMapper.selectOne(new LambdaQueryWrapper<ProductCategory>()
                .eq(ProductCategory::getCategoryCode, dto.getCategoryCode())
                .ne(ProductCategory::getId, dto.getId()));
        if (exist != null) {
            throw new BusinessException(ResultCode.DATA_EXIST, "分类编码已存在");
        }

        BeanUtils.copyProperties(dto, category);
        productCategoryMapper.updateById(category);
        clearCategoryCache();
    }

    @Override
    public void deleteCategory(Long id) {
        ProductCategory category = productCategoryMapper.selectById(id);
        if (category == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }

        Long childCount = productCategoryMapper.selectCount(new LambdaQueryWrapper<ProductCategory>()
                .eq(ProductCategory::getParentId, id));
        if (childCount > 0) {
            throw new BusinessException(ResultCode.CATEGORY_HAS_CHILDREN);
        }

        Long productCount = productMapper.selectCount(new LambdaQueryWrapper<Product>()
                .eq(Product::getCategoryId, id));
        if (productCount > 0) {
            throw new BusinessException(ResultCode.CATEGORY_HAS_PRODUCTS);
        }

        productCategoryMapper.deleteById(id);
        clearCategoryCache();
    }

    @Override
    @SneakyThrows
    public CategoryTreeVO getCategoryTree() {
        Object cachedData = redisTemplate.opsForValue().get(CATEGORY_TREE_CACHE_KEY);
        if (cachedData != null) {
            return objectMapper.convertValue(cachedData, CategoryTreeVO.class);
        }

        List<ProductCategory> allCategories = productCategoryMapper.selectList(new LambdaQueryWrapper<ProductCategory>()
                .eq(ProductCategory::getStatus, 1)
                .orderByAsc(ProductCategory::getSort));

        List<CategoryTreeVO> voList = allCategories.stream()
                .map(this::convertToVO)
                .collect(Collectors.toList());

        List<CategoryTreeVO> roots = voList.stream()
                .filter(vo -> vo.getParentId() == null || vo.getParentId() == 0)
                .collect(Collectors.toList());

        for (CategoryTreeVO root : roots) {
            buildChildren(root, voList);
        }

        CategoryTreeVO result = new CategoryTreeVO();
        result.setId(0L);
        result.setCategoryName("全部");
        result.setParentId(-1L);
        result.setLevel(0);
        result.setChildren(roots);

        redisTemplate.opsForValue().set(CATEGORY_TREE_CACHE_KEY, result, CACHE_EXPIRE_TIME, TimeUnit.HOURS);
        return result;
    }

    @Override
    @SneakyThrows
    public List<CategoryTreeVO> getCategoryList() {
        Object cachedData = redisTemplate.opsForValue().get(CATEGORY_LIST_CACHE_KEY);
        if (cachedData != null) {
            return objectMapper.convertValue(cachedData, new TypeReference<List<CategoryTreeVO>>() {});
        }

        List<ProductCategory> allCategories = productCategoryMapper.selectList(new LambdaQueryWrapper<ProductCategory>()
                .orderByAsc(ProductCategory::getSort));

        List<CategoryTreeVO> voList = allCategories.stream()
                .map(this::convertToVO)
                .collect(Collectors.toList());

        List<CategoryTreeVO> roots = voList.stream()
                .filter(vo -> vo.getParentId() == null || vo.getParentId() == 0)
                .collect(Collectors.toList());

        for (CategoryTreeVO root : roots) {
            buildChildren(root, voList);
        }

        redisTemplate.opsForValue().set(CATEGORY_LIST_CACHE_KEY, roots, CACHE_EXPIRE_TIME, TimeUnit.HOURS);
        return roots;
    }

    @Override
    public ProductCategoryDTO getCategoryById(Long id) {
        ProductCategory category = productCategoryMapper.selectById(id);
        if (category == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }
        ProductCategoryDTO dto = new ProductCategoryDTO();
        BeanUtils.copyProperties(category, dto);
        return dto;
    }

    private void buildChildren(CategoryTreeVO parent, List<CategoryTreeVO> all) {
        List<CategoryTreeVO> children = all.stream()
                .filter(vo -> Objects.equals(vo.getParentId(), parent.getId()))
                .collect(Collectors.toList());
        if (!children.isEmpty()) {
            parent.setChildren(children);
            for (CategoryTreeVO child : children) {
                buildChildren(child, all);
            }
        } else {
            parent.setChildren(new ArrayList<>());
        }
    }

    private CategoryTreeVO convertToVO(ProductCategory category) {
        CategoryTreeVO vo = new CategoryTreeVO();
        BeanUtils.copyProperties(category, vo);
        return vo;
    }

    private void clearCategoryCache() {
        redisTemplate.delete(CATEGORY_TREE_CACHE_KEY);
        redisTemplate.delete(CATEGORY_LIST_CACHE_KEY);
    }
}
