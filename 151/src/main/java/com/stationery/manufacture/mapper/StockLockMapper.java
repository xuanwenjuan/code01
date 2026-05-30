package com.stationery.manufacture.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.stationery.manufacture.entity.StockLock;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.math.BigDecimal;

@Mapper
public interface StockLockMapper extends BaseMapper<StockLock> {

    @Select("SELECT COALESCE(SUM(lock_quantity), 0) FROM stock_lock " +
            "WHERE material_id = #{materialId} AND lock_status = 1 AND deleted = 0")
    BigDecimal sumLockedQuantity(@Param("materialId") Long materialId);
}
