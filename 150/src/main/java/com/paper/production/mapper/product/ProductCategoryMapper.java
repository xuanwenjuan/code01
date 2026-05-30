package com.paper.production.mapper.product;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.paper.production.entity.product.ProductCategory;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface ProductCategoryMapper extends BaseMapper<ProductCategory> {
}
