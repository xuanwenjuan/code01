package com.textile.production.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.textile.production.entity.ProductionOrder;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Mapper
public interface ProductionOrderMapper extends BaseMapper<ProductionOrder> {

    List<ProductionOrder> getOrderWithProcesses(@Param("id") Long id,
                                                @Param("status") String status);

    List<Map<String, Object>> getOrderProgressStatistics(@Param("startDate") LocalDateTime startDate,
                                                          @Param("endDate") LocalDateTime endDate);

    List<Map<String, Object>> getOrderEfficiencyReport(@Param("startDate") LocalDateTime startDate,
                                                        @Param("endDate") LocalDateTime endDate);

    List<Map<String, Object>> getDefectiveStatistics(@Param("startDate") LocalDateTime startDate,
                                                     @Param("endDate") LocalDateTime endDate);
}
