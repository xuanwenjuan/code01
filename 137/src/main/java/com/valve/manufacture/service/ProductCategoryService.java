package com.valve.manufacture.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.valve.manufacture.entity.ProductCategory;
import com.valve.manufacture.exception.BusinessException;
import com.valve.manufacture.mapper.ProductCategoryMapper;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductCategoryService extends ServiceImpl<ProductCategoryMapper, ProductCategory> {

    public List<ProductCategory> tree() {
        List<ProductCategory> allCategories = list(new LambdaQueryWrapper<ProductCategory>()
                .eq(ProductCategory::getDeleted, 0)
                .orderByAsc(ProductCategory::getPriority));

        return buildTree(allCategories, 0L);
    }

    private List<ProductCategory> buildTree(List<ProductCategory> allCategories, Long parentId) {
        List<ProductCategory> tree = new ArrayList<>();
        for (ProductCategory category : allCategories) {
            if (parentId.equals(category.getParentId())) {
                category.setChildren(buildTree(allCategories, category.getId()));
                tree.add(category);
            }
        }
        return tree;
    }

    public ProductCategory create(ProductCategory category) {
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
        return category;
    }

    public ProductCategory update(Long id, ProductCategory category) {
        ProductCategory existCategory = getById(id);
        if (existCategory == null) {
            throw new BusinessException("分类不存在");
        }
        category.setId(id);
        updateById(category);
        return getById(id);
    }

    public void delete(Long id) {
        ProductCategory category = getById(id);
        if (category == null) {
            throw new BusinessException("分类不存在");
        }

        Long count = count(new LambdaQueryWrapper<ProductCategory>()
                .eq(ProductCategory::getParentId, id)
                .eq(ProductCategory::getDeleted, 0));
        if (count > 0) {
            throw new BusinessException("存在子分类，无法删除");
        }

        removeById(id);
    }

    public List<ProductCategory> getByParentId(Long parentId) {
        return list(new LambdaQueryWrapper<ProductCategory>()
                .eq(ProductCategory::getParentId, parentId)
                .eq(ProductCategory::getDeleted, 0)
                .orderByAsc(ProductCategory::getPriority));
    }
}
