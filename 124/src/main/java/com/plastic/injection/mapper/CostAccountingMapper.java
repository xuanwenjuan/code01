package com.plastic.injection.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.plastic.injection.entity.CostAccounting;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Mapper
public interface CostAccountingMapper extends BaseMapper<CostAccounting> {

    BigDecimal getTotalMaterialCostByCategory(@Param("categoryId") Long categoryId,
                                              @Param("startDate") LocalDate startDate,
                                              @Param("endDate") LocalDate endDate);

    List<CostAccounting> getCategoryStatistics(@Param("startDate") LocalDate startDate,
                                                @Param("endDate") LocalDate endDate);
}
