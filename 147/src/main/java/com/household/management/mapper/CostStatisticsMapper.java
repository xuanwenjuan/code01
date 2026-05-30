package com.household.management.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.household.management.entity.CostStatistics;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.math.BigDecimal;

@Mapper
public interface CostStatisticsMapper extends BaseMapper<CostStatistics> {

    @Select("SELECT COALESCE(SUM(total_amount), 0) FROM raw_material_inbound " +
            "WHERE status = 2 AND deleted = 0 " +
            "AND DATE_FORMAT(create_time, '%Y-%m') = #{month}")
    BigDecimal calculateMaterialCost(@Param("month") String month);

    @Select("SELECT COALESCE(SUM(total_amount), 0) FROM sales_outbound " +
            "WHERE status = 2 AND deleted = 0 " +
            "AND DATE_FORMAT(create_time, '%Y-%m') = #{month}")
    BigDecimal calculateSalesRevenue(@Param("month") String month);
}
