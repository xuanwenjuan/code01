package com.firecontrol.service;

import com.firecontrol.dto.ProductCategoryDTO;
import com.firecontrol.entity.ProductCategory;

import java.util.List;

public interface ProductCategoryService {

    void addCategory(ProductCategoryDTO dto);

    void updateCategory(ProductCategoryDTO dto);

    void deleteCategory(Long id);

    ProductCategory getCategoryById(Long id);

    List<ProductCategory> getCategoryTree();

    List<ProductCategory> getChildrenByParentId(Long parentId);

    void updatePriority(Long id, Integer priority);

    void updateStatus(Long id, Integer status);
}
