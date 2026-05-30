package com.heritage.dye.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.heritage.dye.po.MaterialOriginPO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Update;

import java.math.BigDecimal;

@Mapper
public interface MaterialOriginMapper extends BaseMapper<MaterialOriginPO> {

    @Update("UPDATE material_origin SET locked_stock = locked_stock + #{quantity}, " +
            "current_stock = current_stock - #{quantity}, version = version + 1 " +
            "WHERE id = #{id} AND current_stock >= #{quantity} AND deleted = 0")
    int lockStock(@Param("id") Long id, @Param("quantity") BigDecimal quantity);

    @Update("UPDATE material_origin SET locked_stock = locked_stock - #{quantity}, " +
            "current_stock = current_stock + #{quantity}, version = version + 1 " +
            "WHERE id = #{id} AND locked_stock >= #{quantity} AND deleted = 0")
    int unlockStock(@Param("id") Long id, @Param("quantity") BigDecimal quantity);

    @Update("UPDATE material_origin SET locked_stock = locked_stock - #{quantity}, " +
            "version = version + 1 WHERE id = #{id} AND locked_stock >= #{quantity} AND deleted = 0")
    int deductLockedStock(@Param("id") Long id, @Param("quantity") BigDecimal quantity);
}
