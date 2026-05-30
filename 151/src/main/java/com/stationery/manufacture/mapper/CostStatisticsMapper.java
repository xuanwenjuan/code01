package com.stationery.manufacture.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.stationery.manufacture.entity.CostStatistics;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Mapper
public interface CostStatisticsMapper extends BaseMapper<CostStatistics> {

    @Select("SELECT COALESCE(SUM(total_price), 0) FROM order_material WHERE order_id = #{orderId}")
    BigDecimal calculateMaterialCost(@Param("orderId") Long orderId);

    @Select("SELECT COALESCE(SUM(working_hours * 50), 0) FROM order_process WHERE order_id = #{orderId}")
    BigDecimal calculateEquipmentCost(@Param("orderId") Long orderId);

    @Select("SELECT COALESCE(SUM(working_hours * 80), 0) FROM order_process WHERE order_id = #{orderId}")
    BigDecimal calculateLaborCost(@Param("orderId") Long orderId);

    @Select("SELECT " +
            "c.period, " +
            "COALESCE(SUM(c.material_cost), 0) as materialCost, " +
            "COALESCE(SUM(c.equipment_cost), 0) as equipmentCost, " +
            "COALESCE(SUM(c.labor_cost), 0) as laborCost, " +
            "COALESCE(SUM(c.defective_cost), 0) as defectiveCost, " +
            "COALESCE(SUM(c.total_cost), 0) as totalCost " +
            "FROM cost_statistics c " +
            "WHERE c.create_time BETWEEN #{startTime} AND #{endTime} " +
            "GROUP BY c.period " +
            "ORDER BY c.period")
    List<Map<String, Object>> getPeriodCostReport(@Param("startTime") LocalDateTime startTime,
                                                  @Param("endTime") LocalDateTime endTime);

    @Select("SELECT " +
            "p.category_name as categoryName, " +
            "COALESCE(SUM(c.total_cost), 0) as totalCost, " +
            "COUNT(DISTINCT c.order_id) as orderCount " +
            "FROM cost_statistics c " +
            "LEFT JOIN production_order p ON c.order_id = p.id " +
            "WHERE c.create_time BETWEEN #{startTime} AND #{endTime} " +
            "GROUP BY p.category_name " +
            "ORDER BY totalCost DESC")
    List<Map<String, Object>> getCategoryCostReport(@Param("startTime") LocalDateTime startTime,
                                                    @Param("endTime") LocalDateTime endTime);
}
