package com.fastener.production.mapper.cost;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.fastener.production.entity.cost.ProductionCost;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.math.BigDecimal;

@Mapper
public interface ProductionCostMapper extends BaseMapper<ProductionCost> {

    @Select("SELECT COALESCE(SUM(amount), 0) FROM production_cost WHERE cost_type = #{costType} AND DATE_FORMAT(cost_date, '%Y-%m') = #{month} AND deleted = 0")
    BigDecimal sumAmountByTypeAndMonth(@Param("costType") Integer costType, @Param("month") String month);

    @Select("SELECT * FROM production_cost WHERE cost_no = #{costNo} AND deleted = 0 LIMIT 1")
    ProductionCost selectByCostNo(@Param("costNo") String costNo);
}
