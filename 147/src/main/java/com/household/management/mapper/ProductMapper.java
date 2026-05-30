package com.household.management.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.household.management.entity.Product;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface ProductMapper extends BaseMapper<Product> {

    @Select("SELECT p.*, c.category_name FROM product p " +
            "LEFT JOIN product_category c ON p.category_id = c.id " +
            "WHERE p.deleted = 0 " +
            "ORDER BY p.priority DESC, p.id DESC")
    List<Product> selectProductListWithCategory();
}
