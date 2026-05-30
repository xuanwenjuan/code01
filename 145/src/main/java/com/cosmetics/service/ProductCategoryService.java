package com.cosmetics.service;

import com.cosmetics.entity.ProductCategory;
import com.cosmetics.vo.CategoryTreeVO;

import java.util.List;

public interface ProductCategoryService {

    List<CategoryTreeVO> getCategoryTree();

    ProductCategory getById(Long id);

    void add(ProductCategory category);

    void update(ProductCategory category);

    void delete(Long id);
}
