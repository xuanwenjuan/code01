package com.fan.impeller.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.fan.impeller.entity.ProductCategory;
import com.fan.impeller.exception.BusinessException;
import com.fan.impeller.mapper.ProductCategoryMapper;
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
            if (category.getParentId().equals(parentId)) {
                category.setChildren(buildTree(allList, category.getId()));
                treeList.add(category);
            }
        }
        return treeList;
    }

    public void addCategory(ProductCategory category) {
        ProductCategory exist = getOne(new LambdaQueryWrapper<ProductCategory>()
                .eq(ProductCategory::getCategoryCode, category.getCategoryCode()));
        if (exist != null) {
            throw new BusinessException("分类编码已存在");
        }

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

    public void updateCategory(ProductCategory category) {
        ProductCategory exist = getById(category.getId());
        if (exist == null) {
            throw new BusinessException("分类不存在");
        }
        updateById(category);
    }

    public void offline(Long id) {
        ProductCategory category = getById(id);
        if (category == null) {
            throw new BusinessException("分类不存在");
        }
        category.setStatus(0);
        updateById(category);
    }

    public List<ProductCategory> listByPriority() {
        return list(new LambdaQueryWrapper<ProductCategory>()
                .eq(ProductCategory::getStatus, 1)
                .orderByDesc(ProductCategory::getPriority)
                .orderByAsc(ProductCategory::getSort));
    }
}
