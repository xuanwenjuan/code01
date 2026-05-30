package com.plastic.injection.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.plastic.injection.entity.ProductCategory;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface ProductCategoryMapper extends BaseMapper<ProductCategory> {
}
