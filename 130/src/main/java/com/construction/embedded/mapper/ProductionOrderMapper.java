package com.construction.embedded.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.construction.embedded.entity.ProductionOrder;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface ProductionOrderMapper extends BaseMapper<ProductionOrder> {
}
