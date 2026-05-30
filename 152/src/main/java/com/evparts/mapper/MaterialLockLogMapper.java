package com.evparts.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.evparts.entity.MaterialLockLog;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.math.BigDecimal;
import java.util.List;

@Mapper
public interface MaterialLockLogMapper extends BaseMapper<MaterialLockLog> {

    @Select("SELECT COALESCE(SUM(lock_quantity), 0) FROM material_lock_log WHERE material_id = #{materialId} AND status = 1 AND deleted = 0")
    BigDecimal getTotalLockedQuantity(@Param("materialId") Long materialId);

    List<MaterialLockLog> getByWorkOrderId(@Param("workOrderId") Long workOrderId);

    int releaseByWorkOrderId(@Param("workOrderId") Long workOrderId);

}
