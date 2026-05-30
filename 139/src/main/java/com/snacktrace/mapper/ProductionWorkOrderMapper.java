package com.snacktrace.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.snacktrace.entity.ProductionWorkOrder;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface ProductionWorkOrderMapper extends BaseMapper<ProductionWorkOrder> {
}
