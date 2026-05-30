package com.household.management.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.household.management.entity.SalesOutboundDetail;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface SalesOutboundDetailMapper extends BaseMapper<SalesOutboundDetail> {

    @Select("SELECT sod.*, p.product_name, p.product_code, p.specification, p.unit " +
            "FROM sales_outbound_detail sod " +
            "LEFT JOIN product p ON sod.product_id = p.id " +
            "WHERE sod.outbound_id = #{outboundId} " +
            "ORDER BY sod.id")
    List<SalesOutboundDetail> selectByOutboundId(@Param("outboundId") Long outboundId);
}
