package com.snacktrace.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.snacktrace.entity.WorkOrderMaterial;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.math.BigDecimal;

@Mapper
public interface WorkOrderMaterialMapper extends BaseMapper<WorkOrderMaterial> {

    @Select("SELECT COALESCE(SUM(total_cost), 0) FROM work_order_material WHERE work_order_id = #{workOrderId} AND deleted = 0")
    BigDecimal sumTotalCostByWorkOrderId(@Param("workOrderId") Long workOrderId);
}
