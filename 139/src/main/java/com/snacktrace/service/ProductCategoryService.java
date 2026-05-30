package com.snacktrace.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.snacktrace.annotation.RequireRole;
import com.snacktrace.entity.ProductCategory;
import com.snacktrace.enums.RoleEnum;
import com.snacktrace.mapper.ProductCategoryMapper;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductCategoryService extends ServiceImpl<ProductCategoryMapper, ProductCategory> {

    public List<ProductCategory> getTree() {
        List<ProductCategory> allCategories = list(
                new LambdaQueryWrapper<ProductCategory>()
                        .orderByAsc(ProductCategory::getSortOrder)
        );

        return buildTree(allCategories, 0L);
    }

    private List<ProductCategory> buildTree(List<ProductCategory> allCategories, Long parentId) {
        List<ProductCategory> tree = new ArrayList<>();
        for (ProductCategory category : allCategories) {
            if (category.getParentId().equals(parentId)) {
                category.setChildren(buildTree(allCategories, category.getId()));
                tree.add(category);
            }
        }
        return tree;
    }

    @RequireRole({RoleEnum.ADMIN, RoleEnum.R_D})
    public boolean addCategory(ProductCategory category) {
        return save(category);
    }

    @RequireRole({RoleEnum.ADMIN, RoleEnum.R_D})
    public boolean updateCategory(ProductCategory category) {
        return updateById(category);
    }

    @RequireRole({RoleEnum.ADMIN, RoleEnum.R_D})
    public boolean deleteCategory(Long id) {
        return removeById(id);
    }
}
