package com.household.management.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.household.management.entity.SalesOrderDetail;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface SalesOrderDetailMapper extends BaseMapper<SalesOrderDetail> {

    @Select("SELECT sod.*, p.product_name, p.product_code, p.specification, p.unit " +
            "FROM sales_order_detail sod " +
            "LEFT JOIN product p ON sod.product_id = p.id " +
            "WHERE sod.order_id = #{orderId} " +
            "ORDER BY sod.id")
    List<SalesOrderDetail> selectByOrderId(@Param("orderId") Long orderId);
}
