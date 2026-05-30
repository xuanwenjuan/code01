package com.spindle.manage.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.spindle.manage.entity.ProductionLossRecord;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.math.BigDecimal;
import java.util.List;

@Mapper
public interface ProductionLossRecordMapper extends BaseMapper<ProductionLossRecord> {

    BigDecimal getTotalLossAmountByOrderId(@Param("orderId") Long orderId);

    List<ProductionLossRecord> getLossRecordsByOrderId(@Param("orderId") Long orderId);

}
