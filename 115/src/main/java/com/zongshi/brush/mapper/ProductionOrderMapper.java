package com.zongshi.brush.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.zongshi.brush.entity.ProductionOrder;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface ProductionOrderMapper extends BaseMapper<ProductionOrder> {

    List<ProductionOrder> selectTimeoutOrders(@Param("statusList") List<Integer> statusList);
}
