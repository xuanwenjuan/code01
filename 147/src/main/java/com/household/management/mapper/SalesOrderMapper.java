package com.household.management.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.household.management.entity.SalesOrder;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface SalesOrderMapper extends BaseMapper<SalesOrder> {

    @Select("SELECT so.*, c.customer_name, c.customer_code " +
            "FROM sales_order so " +
            "LEFT JOIN customer c ON so.customer_id = c.id " +
            "WHERE so.deleted = 0 " +
            "ORDER BY so.priority DESC, so.create_time DESC")
    List<SalesOrder> selectOrderList();

    @Select("SELECT so.*, c.customer_name, c.customer_code " +
            "FROM sales_order so " +
            "LEFT JOIN customer c ON so.customer_id = c.id " +
            "WHERE so.deleted = 0 AND so.id = #{id}")
    SalesOrder selectOrderDetail(@Param("id") Long id);
}
