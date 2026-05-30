package com.spindle.manage.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.spindle.manage.dto.ProductionOrderQueryDTO;
import com.spindle.manage.entity.ProductionOrder;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface ProductionOrderMapper extends BaseMapper<ProductionOrder> {

    List<ProductionOrder> queryByConditions(@Param("dto") ProductionOrderQueryDTO dto);

}
