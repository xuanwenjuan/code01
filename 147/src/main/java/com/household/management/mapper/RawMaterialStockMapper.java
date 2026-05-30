package com.household.management.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.household.management.entity.RawMaterialStock;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.math.BigDecimal;
import java.util.List;

@Mapper
public interface RawMaterialStockMapper extends BaseMapper<RawMaterialStock> {

    @Select("SELECT rms.*, rm.material_name, rm.material_code, rm.material_type, rm.is_moisture_sensitive, " +
            "(rms.quantity - COALESCE(rms.locked_quantity, 0)) as available_quantity " +
            "FROM raw_material_stock rms " +
            "LEFT JOIN raw_material rm ON rms.material_id = rm.id " +
            "WHERE rms.deleted = 0 " +
            "ORDER BY rms.create_time DESC")
    List<RawMaterialStock> selectStockListWithMaterial();

    @Select("SELECT rms.*, rm.material_name, rm.material_code, rm.material_type, rm.is_moisture_sensitive, " +
            "(rms.quantity - COALESCE(rms.locked_quantity, 0)) as available_quantity " +
            "FROM raw_material_stock rms " +
            "LEFT JOIN raw_material rm ON rms.material_id = rm.id " +
            "WHERE rms.deleted = 0 AND rms.status = 1 " +
            "AND rm.is_moisture_sensitive = 1 " +
            "AND DATEDIFF(rms.expiration_date, NOW()) <= #{warningDays} " +
            "ORDER BY rms.expiration_date ASC")
    List<RawMaterialStock> selectMoistureWarningStock(@Param("warningDays") Integer warningDays);

    @Update("UPDATE raw_material_stock SET locked_quantity = COALESCE(locked_quantity, 0) + #{quantity} " +
            "WHERE id = #{stockId} AND status = 1 AND (quantity - COALESCE(locked_quantity, 0)) >= #{quantity}")
    int lockStock(@Param("stockId") Long stockId, @Param("quantity") BigDecimal quantity);

    @Update("UPDATE raw_material_stock SET locked_quantity = GREATEST(0, COALESCE(locked_quantity, 0) - #{quantity}) " +
            "WHERE id = #{stockId}")
    int unlockStock(@Param("stockId") Long stockId, @Param("quantity") BigDecimal quantity);

    @Select("SELECT rms.*, (rms.quantity - COALESCE(rms.locked_quantity, 0)) as available_quantity " +
            "FROM raw_material_stock rms " +
            "WHERE rms.material_id = #{materialId} AND rms.status = 1 AND rms.deleted = 0 " +
            "AND (rms.quantity - COALESCE(rms.locked_quantity, 0)) > 0 " +
            "ORDER BY rms.expiration_date ASC")
    List<RawMaterialStock> selectAvailableStockByMaterialId(@Param("materialId") Long materialId);
}
