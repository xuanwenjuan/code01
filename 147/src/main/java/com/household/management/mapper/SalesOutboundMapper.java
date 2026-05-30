package com.household.management.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.household.management.entity.SalesOutbound;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface SalesOutboundMapper extends BaseMapper<SalesOutbound> {

    @Select("SELECT so.*, c.customer_name, so2.order_no, su.real_name as auditor_name " +
            "FROM sales_outbound so " +
            "LEFT JOIN customer c ON so.customer_id = c.id " +
            "LEFT JOIN sales_order so2 ON so.order_id = so2.id " +
            "LEFT JOIN sys_user su ON so.auditor_id = su.id " +
            "WHERE so.deleted = 0 " +
            "ORDER BY so.create_time DESC")
    List<SalesOutbound> selectOutboundList();

    @Select("SELECT so.*, c.customer_name, so2.order_no, su.real_name as auditor_name " +
            "FROM sales_outbound so " +
            "LEFT JOIN customer c ON so.customer_id = c.id " +
            "LEFT JOIN sales_order so2 ON so.order_id = so2.id " +
            "LEFT JOIN sys_user su ON so.auditor_id = su.id " +
            "WHERE so.deleted = 0 AND so.id = #{id}")
    SalesOutbound selectOutboundDetail(@Param("id") Long id);
}
