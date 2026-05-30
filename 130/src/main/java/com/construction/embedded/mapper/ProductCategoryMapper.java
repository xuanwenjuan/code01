package com.construction.embedded.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.construction.embedded.entity.ProductCategory;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface ProductCategoryMapper extends BaseMapper<ProductCategory> {
}
