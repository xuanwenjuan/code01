package com.woodendoor.production.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.woodendoor.production.entity.ProductCategory;
import com.woodendoor.production.exception.BusinessException;
import com.woodendoor.production.mapper.ProductCategoryMapper;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductCategoryService extends ServiceImpl<ProductCategoryMapper, ProductCategory> {

    public List<ProductCategory> tree() {
        List<ProductCategory> allList = list(new LambdaQueryWrapper<ProductCategory>()
                .orderByAsc(ProductCategory::getSort)
                .orderByDesc(ProductCategory::getPriority));

        return buildTree(allList, 0L);
    }

    private List<ProductCategory> buildTree(List<ProductCategory> allList, Long parentId) {
        List<ProductCategory> treeList = new ArrayList<>();
        for (ProductCategory category : allList) {
            if (parentId.equals(category.getParentId())) {
                category.setChildren(buildTree(allList, category.getId()));
                treeList.add(category);
            }
        }
        return treeList;
    }

    public void addCategory(ProductCategory category) {
        if (category.getParentId() == null || category.getParentId() == 0) {
            category.setParentId(0L);
            category.setLevel(1);
        } else {
            ProductCategory parent = getById(category.getParentId());
            if (parent == null) {
                throw new BusinessException("父分类不存在");
            }
            category.setLevel(parent.getLevel() + 1);
        }
        save(category);
    }

    public void updateStatus(Long id, Integer status) {
        ProductCategory category = getById(id);
        if (category == null) {
            throw new BusinessException("分类不存在");
        }
        category.setStatus(status);
        updateById(category);
    }

    public List<ProductCategory> getByLevel(Integer level) {
        return list(new LambdaQueryWrapper<ProductCategory>()
                .eq(ProductCategory::getLevel, level)
                .orderByAsc(ProductCategory::getSort));
    }
}