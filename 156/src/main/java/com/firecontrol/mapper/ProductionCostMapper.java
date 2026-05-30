package com.firecontrol.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.firecontrol.entity.ProductionCost;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.time.LocalDate;
import java.util.List;

@Mapper
public interface ProductionCostMapper extends BaseMapper<ProductionCost> {

    @Select("SELECT * FROM production_cost WHERE cost_date BETWEEN #{startDate} AND #{endDate}")
    List<ProductionCost> selectByDateRange(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Select("SELECT * FROM production_cost WHERE work_order_id = #{workOrderId}")
    List<ProductionCost> selectByWorkOrderId(@Param("workOrderId") Long workOrderId);
}
