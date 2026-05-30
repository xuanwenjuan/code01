package com.fitness.manufacture.service;

import com.fitness.manufacture.common.PageQuery;
import com.fitness.manufacture.common.PageResult;
import com.fitness.manufacture.dto.ProductDTO;
import com.fitness.manufacture.entity.Product;

public interface ProductService {

    void saveProduct(ProductDTO dto);

    void updateProduct(ProductDTO dto);

    void deleteProduct(Long id);

    void stopProduction(Long id);

    void updatePriority(Long id, Integer priority);

    ProductDTO getProductById(Long id);

    PageResult<Product> getProductPage(PageQuery query, Long categoryId, Integer status);
}
