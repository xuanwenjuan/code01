package com.stationery.manufacture.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.stationery.manufacture.entity.ProductionLoss;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Mapper
public interface ProductionLossMapper extends BaseMapper<ProductionLoss> {

    @Select("SELECT COALESCE(SUM(loss_amount), 0) FROM production_loss " +
            "WHERE order_id = #{orderId} AND deleted = 0")
    BigDecimal sumLossAmountByOrder(@Param("orderId") Long orderId);

    @Select("SELECT " +
            "loss_type as lossType, " +
            "loss_reason as lossReason, " +
            "COALESCE(SUM(loss_quantity), 0) as totalQuantity, " +
            "COALESCE(SUM(loss_amount), 0) as totalAmount " +
            "FROM production_loss " +
            "WHERE create_time BETWEEN #{startTime} AND #{endTime} AND deleted = 0 " +
            "GROUP BY loss_type, loss_reason " +
            "ORDER BY totalAmount DESC")
    List<Map<String, Object>> getLossStatistics(@Param("startTime") LocalDateTime startTime,
                                                 @Param("endTime") LocalDateTime endTime);
}
