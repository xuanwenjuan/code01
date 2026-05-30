package com.zongshi.brush.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.zongshi.brush.entity.CostRevenueLedger;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.math.BigDecimal;
import java.time.LocalDate;

@Mapper
public interface CostRevenueLedgerMapper extends BaseMapper<CostRevenueLedger> {

    BigDecimal selectTotalMaterialCost(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    BigDecimal selectTotalLaborCost(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    BigDecimal selectTotalRevenue(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    Integer selectTotalProductionQuantity(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
}
