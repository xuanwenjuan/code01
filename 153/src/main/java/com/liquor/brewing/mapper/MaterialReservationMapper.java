package com.liquor.brewing.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.liquor.brewing.entity.MaterialReservation;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.math.BigDecimal;

@Mapper
public interface MaterialReservationMapper extends BaseMapper<MaterialReservation> {

    @Select("SELECT IFNULL(SUM(quantity), 0) FROM material_reservation " +
            "WHERE material_id = #{materialId} AND status = 1 AND deleted = 0 " +
            "AND (expire_time IS NULL OR expire_time > NOW())")
    BigDecimal getReservedQuantity(@Param("materialId") Long materialId);
}
