package com.hardware.stamping.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.hardware.stamping.dto.ProductionOrderQueryDTO;
import com.hardware.stamping.entity.ProductionOrder;
import com.hardware.stamping.vo.ProductionOrderVO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface ProductionOrderMapper extends BaseMapper<ProductionOrder> {

    IPage<ProductionOrderVO> queryPage(Page<ProductionOrderVO> page, @Param("query") ProductionOrderQueryDTO query);
}
