package com.spring.manufacturing.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.spring.manufacturing.entity.ProductionWorkOrder;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface ProductionWorkOrderMapper extends BaseMapper<ProductionWorkOrder> {
}