package com.fitness.manufacture.service;

import com.fitness.manufacture.dto.ProductCategoryDTO;
import com.fitness.manufacture.vo.CategoryTreeVO;

import java.util.List;

public interface ProductCategoryService {

    void saveCategory(ProductCategoryDTO dto);

    void updateCategory(ProductCategoryDTO dto);

    void deleteCategory(Long id);

    CategoryTreeVO getCategoryTree();

    List<CategoryTreeVO> getCategoryList();

    ProductCategoryDTO getCategoryById(Long id);
}
