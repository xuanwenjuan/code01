package com.snacktrace.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.snacktrace.entity.WorkOrderMaterialLoss;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Mapper
public interface WorkOrderMaterialLossMapper extends BaseMapper<WorkOrderMaterialLoss> {

    @Select("SELECT COALESCE(SUM(loss_quantity), 0) FROM work_order_material_loss WHERE work_order_id = #{workOrderId} AND deleted = 0")
    BigDecimal sumLossQuantityByWorkOrderId(@Param("workOrderId") Long workOrderId);

    @Select("SELECT material_id, COALESCE(SUM(loss_quantity), 0) as total_loss FROM work_order_material_loss " +
            "WHERE create_time >= #{startDate} AND create_time < #{endDate} AND deleted = 0 " +
            "GROUP BY material_id")
    List<Object[]> sumLossByMaterialAndDate(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
}
