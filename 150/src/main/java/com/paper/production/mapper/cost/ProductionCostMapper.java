package com.paper.production.mapper.cost;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.paper.production.entity.cost.ProductionCost;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface ProductionCostMapper extends BaseMapper<ProductionCost> {
}
