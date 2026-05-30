package com.household.management.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.household.management.common.exception.BusinessException;
import com.household.management.common.result.ResultCode;
import com.household.management.entity.ProductCategory;
import com.household.management.mapper.ProductCategoryMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
public class ProductCategoryService {

    private final ProductCategoryMapper categoryMapper;

    public ProductCategoryService(ProductCategoryMapper categoryMapper) {
        this.categoryMapper = categoryMapper;
    }

    public List<ProductCategory> getTree() {
        List<ProductCategory> allCategories = categoryMapper.selectList(
                new LambdaQueryWrapper<ProductCategory>()
                        .eq(ProductCategory::getStatus, 1)
                        .orderByAsc(ProductCategory::getSortOrder));

        Map<Long, List<ProductCategory>> childrenMap = allCategories.stream()
                .collect(Collectors.groupingBy(c -> c.getParentId() == null ? 0L : c.getParentId()));

        List<ProductCategory> rootCategories = childrenMap.getOrDefault(0L, new ArrayList<>());
        buildTree(rootCategories, childrenMap);

        return rootCategories;
    }

    private void buildTree(List<ProductCategory> categories, Map<Long, List<ProductCategory>> childrenMap) {
        for (ProductCategory category : categories) {
            List<ProductCategory> children = childrenMap.get(category.getId());
            if (children != null && !children.isEmpty()) {
                category.setChildren(children);
                buildTree(children, childrenMap);
            }
        }
    }

    public List<ProductCategory> list() {
        return categoryMapper.selectList(
                new LambdaQueryWrapper<ProductCategory>().orderByAsc(ProductCategory::getSortOrder));
    }

    public ProductCategory getById(Long id) {
        ProductCategory category = categoryMapper.selectById(id);
        if (category == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }
        return category;
    }

    @Transactional(rollbackFor = Exception.class)
    public void add(ProductCategory category) {
        LambdaQueryWrapper<ProductCategory> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ProductCategory::getCategoryCode, category.getCategoryCode());
        if (categoryMapper.selectCount(wrapper) > 0) {
            throw new BusinessException("分类编码已存在");
        }
        if (category.getParentId() == null) {
            category.setParentId(0L);
        }
        categoryMapper.insert(category);
        log.info("新增产品分类：{}", category.getCategoryName());
    }

    @Transactional(rollbackFor = Exception.class)
    public void update(ProductCategory category) {
        ProductCategory existing = categoryMapper.selectById(category.getId());
        if (existing == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }
        if (!existing.getCategoryCode().equals(category.getCategoryCode())) {
            LambdaQueryWrapper<ProductCategory> wrapper = new LambdaQueryWrapper<>();
            wrapper.eq(ProductCategory::getCategoryCode, category.getCategoryCode());
            if (categoryMapper.selectCount(wrapper) > 0) {
                throw new BusinessException("分类编码已存在");
            }
        }
        categoryMapper.updateById(category);
        log.info("更新产品分类：{}", category.getCategoryName());
    }

    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        ProductCategory category = categoryMapper.selectById(id);
        if (category == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }
        LambdaQueryWrapper<ProductCategory> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ProductCategory::getParentId, id);
        if (categoryMapper.selectCount(wrapper) > 0) {
            throw new BusinessException("存在子分类，无法删除");
        }
        categoryMapper.deleteById(id);
        log.info("删除产品分类：{}", category.getCategoryName());
    }

    public void updateStatus(Long id, Integer status) {
        ProductCategory category = new ProductCategory();
        category.setId(id);
        category.setStatus(status);
        categoryMapper.updateById(category);
    }
}
