package com.textile.production.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.textile.production.entity.RawMaterial;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Mapper
public interface RawMaterialMapper extends BaseMapper<RawMaterial> {

    List<RawMaterial> getMaterialWithAvailableBatches(@Param("type") String type,
                                                      @Param("status") String status,
                                                      @Param("keyword") String keyword);

    List<Map<String, Object>> getMaterialStockStatistics();

    List<Map<String, Object>> getBatchUsageStatistics(@Param("startDate") LocalDateTime startDate,
                                                      @Param("endDate") LocalDateTime endDate);
}
