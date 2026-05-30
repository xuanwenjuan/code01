package com.household.management.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.household.management.entity.ProductCost;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface ProductCostMapper extends BaseMapper<ProductCost> {

    @Select("SELECT pc.*, p.product_name, pwo.work_order_no " +
            "FROM product_cost pc " +
            "LEFT JOIN product p ON pc.product_id = p.id " +
            "LEFT JOIN production_work_order pwo ON pc.work_order_id = pwo.id " +
            "WHERE pc.deleted = 0 " +
            "ORDER BY pc.create_time DESC")
    List<ProductCost> selectProductCostList();

    @Select("SELECT pc.*, p.product_name, pwo.work_order_no " +
            "FROM product_cost pc " +
            "LEFT JOIN product p ON pc.product_id = p.id " +
            "LEFT JOIN production_work_order pwo ON pc.work_order_id = pwo.id " +
            "WHERE pc.deleted = 0 AND pc.id = #{id}")
    ProductCost selectProductCostDetail(@Param("id") Long id);

    @Select("SELECT pc.*, p.product_name, pwo.work_order_no " +
            "FROM product_cost pc " +
            "LEFT JOIN product p ON pc.product_id = p.id " +
            "LEFT JOIN production_work_order pwo ON pc.work_order_id = pwo.id " +
            "WHERE pc.deleted = 0 " +
            "AND (#{statisticsMonth} IS NULL OR pc.statistics_month = #{statisticsMonth}) " +
            "AND (#{productId} IS NULL OR pc.product_id = #{productId}) " +
            "ORDER BY pc.create_time DESC")
    List<ProductCost> selectProductCostByConditions(@Param("statisticsMonth") String statisticsMonth,
                                                    @Param("productId") Long productId);
}
