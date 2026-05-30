package com.fastener.production.mapper.product;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.fastener.production.entity.product.ProductCategory;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface ProductCategoryMapper extends BaseMapper<ProductCategory> {

    @Select("SELECT * FROM product_category WHERE parent_id = #{parentId} AND deleted = 0 ORDER BY sort_order ASC, id ASC")
    List<ProductCategory> selectByParentId(@Param("parentId") Long parentId);

    @Select("SELECT * FROM product_category WHERE category_code = #{categoryCode} AND deleted = 0 LIMIT 1")
    ProductCategory selectByCode(@Param("categoryCode") String categoryCode);

    @Select("SELECT COUNT(*) FROM product_category WHERE parent_id = #{parentId} AND deleted = 0")
    Integer countChildren(@Param("parentId") Long parentId);
}
