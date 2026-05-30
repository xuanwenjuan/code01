package com.spindle.manage.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.spindle.manage.dto.MaterialQueryDTO;
import com.spindle.manage.entity.MaterialInventory;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.math.BigDecimal;
import java.util.List;

@Mapper
public interface MaterialInventoryMapper extends BaseMapper<MaterialInventory> {

    List<MaterialInventory> queryByConditions(@Param("dto") MaterialQueryDTO dto);

    BigDecimal getAvailableQuantity(@Param("materialId") Long materialId);

}
