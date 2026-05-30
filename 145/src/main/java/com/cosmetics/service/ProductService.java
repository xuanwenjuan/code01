package com.cosmetics.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.cosmetics.common.PageQuery;
import com.cosmetics.entity.Product;

public interface ProductService {

    Page<Product> getPage(PageQuery pageQuery, Long categoryId, String keyword, Integer status);

    Product getById(Long id);

    void add(Product product);

    void update(Product product);

    void delete(Long id);

    void updateStatus(Long id, Integer status);
}
