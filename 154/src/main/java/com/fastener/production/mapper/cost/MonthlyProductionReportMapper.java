package com.fastener.production.mapper.cost;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.fastener.production.entity.cost.MonthlyProductionReport;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface MonthlyProductionReportMapper extends BaseMapper<MonthlyProductionReport> {

    @Select("SELECT * FROM monthly_production_report WHERE report_month = #{reportMonth} AND deleted = 0 LIMIT 1")
    MonthlyProductionReport selectByMonth(@Param("reportMonth") String reportMonth);
}
