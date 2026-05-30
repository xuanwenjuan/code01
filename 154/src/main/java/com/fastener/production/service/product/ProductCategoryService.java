package com.fastener.production.service.product;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import com.fastener.production.common.entity.PageQuery;
import com.fastener.production.entity.product.ProductCategory;
import com.fastener.production.entity.product.dto.ProductCategoryDTO;
import com.fastener.production.entity.product.vo.ProductCategoryTreeVO;

import java.util.List;

public interface ProductCategoryService extends IService<ProductCategory> {

    IPage<ProductCategory> page(PageQuery pageQuery, String categoryName, Integer status);

    ProductCategoryTreeVO getTree();

    List<ProductCategoryTreeVO> getChildren(Long parentId);

    void add(ProductCategoryDTO dto);

    void update(ProductCategoryDTO dto);

    void delete(Long id);

    void updateStatus(Long id, Integer status);
}
