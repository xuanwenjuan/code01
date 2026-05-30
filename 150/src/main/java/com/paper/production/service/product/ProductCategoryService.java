package com.paper.production.service.product;

import com.baomidou.mybatisplus.extension.service.IService;
import com.paper.production.dto.product.ProductCategoryDTO;
import com.paper.production.entity.product.ProductCategory;
import com.paper.production.vo.product.ProductCategoryTreeVO;

import java.util.List;

public interface ProductCategoryService extends IService<ProductCategory> {

    void saveCategory(ProductCategoryDTO dto);

    void updateCategory(ProductCategoryDTO dto);

    void deleteCategory(Long id);

    List<ProductCategoryTreeVO> getCategoryTree();

    List<ProductCategoryTreeVO> getCategoryTreeByType(String categoryType);

    void stopProduction(Long id);

    void updatePriority(Long id, Integer priority);
}
