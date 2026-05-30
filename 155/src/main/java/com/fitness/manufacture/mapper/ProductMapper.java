package com.fitness.manufacture.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.fitness.manufacture.entity.Product;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface ProductMapper extends BaseMapper<Product> {
}
