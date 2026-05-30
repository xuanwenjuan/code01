package com.instrument.consignment.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.instrument.consignment.po.MaterialStockPO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface MaterialStockMapper extends BaseMapper<MaterialStockPO> {

    int lockStock(@Param("materialId") Long materialId, @Param("quantity") Integer quantity);

    int unlockStock(@Param("materialId") Long materialId, @Param("quantity") Integer quantity);

    int deductStock(@Param("materialId") Long materialId, @Param("quantity") Integer quantity);
}
