package com.amber.polish.mapper;

import com.amber.polish.entity.ProfitLedger;
import com.amber.polish.vo.ProfitStatisticsVO;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDate;
import java.util.List;

@Mapper
public interface ProfitLedgerMapper extends BaseMapper<ProfitLedger> {

    List<ProfitStatisticsVO> statisticsByCategory(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
}
