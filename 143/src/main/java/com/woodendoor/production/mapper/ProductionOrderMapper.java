package com.woodendoor.production.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.woodendoor.production.entity.ProductionOrder;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface ProductionOrderMapper extends BaseMapper<ProductionOrder> {
}