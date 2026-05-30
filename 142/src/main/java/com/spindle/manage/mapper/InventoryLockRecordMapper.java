package com.spindle.manage.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.spindle.manage.entity.InventoryLockRecord;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.math.BigDecimal;

@Mapper
public interface InventoryLockRecordMapper extends BaseMapper<InventoryLockRecord> {

    BigDecimal getLockedQuantityByMaterialId(@Param("materialId") Long materialId);

}
