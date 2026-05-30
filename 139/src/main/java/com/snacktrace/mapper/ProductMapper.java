package com.snacktrace.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.snacktrace.entity.Product;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface ProductMapper extends BaseMapper<Product> {
}
