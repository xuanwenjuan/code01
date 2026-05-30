package com.woodendoor.production.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.woodendoor.production.entity.ProductionCost;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface ProductionCostMapper extends BaseMapper<ProductionCost> {
}