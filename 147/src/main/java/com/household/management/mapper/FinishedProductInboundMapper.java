package com.household.management.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.household.management.entity.FinishedProductInbound;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface FinishedProductInboundMapper extends BaseMapper<FinishedProductInbound> {

    @Select("SELECT fpi.*, p.product_name, p.product_code, pwo.work_order_no, su.real_name as auditor_name " +
            "FROM finished_product_inbound fpi " +
            "LEFT JOIN product p ON fpi.product_id = p.id " +
            "LEFT JOIN production_work_order pwo ON fpi.work_order_id = pwo.id " +
            "LEFT JOIN sys_user su ON fpi.auditor_id = su.id " +
            "WHERE fpi.deleted = 0 " +
            "ORDER BY fpi.create_time DESC")
    List<FinishedProductInbound> selectInboundList();

    @Select("SELECT fpi.*, p.product_name, p.product_code, pwo.work_order_no, su.real_name as auditor_name " +
            "FROM finished_product_inbound fpi " +
            "LEFT JOIN product p ON fpi.product_id = p.id " +
            "LEFT JOIN production_work_order pwo ON fpi.work_order_id = pwo.id " +
            "LEFT JOIN sys_user su ON fpi.auditor_id = su.id " +
            "WHERE fpi.deleted = 0 AND fpi.id = #{id}")
    FinishedProductInbound selectInboundDetail(@Param("id") Long id);
}
