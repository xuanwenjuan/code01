package com.cosmetics.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.cosmetics.entity.Product;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface ProductMapper extends BaseMapper<Product> {
}
