package com.textile.production.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.textile.production.entity.ProductionCost;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Mapper
public interface ProductionCostMapper extends BaseMapper<ProductionCost> {

    List<Map<String, Object>> getCostDetailReport(@Param("settlementStatus") Integer settlementStatus,
                                                  @Param("startDate") LocalDateTime startDate,
                                                  @Param("endDate") LocalDateTime endDate);

    List<Map<String, Object>> getCostAnalysisReport(@Param("startDate") LocalDateTime startDate,
                                                    @Param("endDate") LocalDateTime endDate);

    List<Map<String, Object>> getCostByCategory(@Param("startDate") LocalDateTime startDate,
                                                @Param("endDate") LocalDateTime endDate);

    List<Map<String, Object>> getMaterialUsageTrace(@Param("orderId") Long orderId,
                                                     @Param("materialId") Long materialId,
                                                     @Param("startDate") LocalDateTime startDate,
                                                     @Param("endDate") LocalDateTime endDate);
}
