package com.fishing.distribution.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.fishing.distribution.entity.RevenueStatistics;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDate;
import java.util.List;

@Mapper
public interface RevenueStatisticsMapper extends BaseMapper<RevenueStatistics> {

    List<RevenueStatistics> selectByDateRange(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("statisticsType") String statisticsType);
}
