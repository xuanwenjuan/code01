package com.construction.material.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.construction.material.entity.MaterialInventory;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.math.BigDecimal;
import java.util.List;

@Mapper
public interface MaterialInventoryMapper extends BaseMapper<MaterialInventory> {

    @Update("UPDATE material_inventory SET quantity = quantity - #{quantity}, update_time = NOW() WHERE id = #{id} AND quantity >= #{quantity}")
    int deductQuantity(@Param("id") Long id, @Param("quantity") BigDecimal quantity);

    @Update("UPDATE material_inventory SET quantity = quantity + #{quantity}, update_time = NOW() WHERE id = #{id}")
    int addQuantity(@Param("id") Long id, @Param("quantity") BigDecimal quantity);

    @Update("UPDATE material_inventory SET locked_quantity = IFNULL(locked_quantity, 0) + #{quantity}, update_time = NOW() " +
            "WHERE id = #{id} AND (quantity - IFNULL(locked_quantity, 0)) >= #{quantity}")
    int lockQuantity(@Param("id") Long id, @Param("quantity") BigDecimal quantity);

    @Update("UPDATE material_inventory SET locked_quantity = IFNULL(locked_quantity, 0) - #{quantity}, " +
            "quantity = quantity - #{quantity}, update_time = NOW() " +
            "WHERE id = #{id} AND IFNULL(locked_quantity, 0) >= #{quantity}")
    int unlockAndDeductQuantity(@Param("id") Long id, @Param("quantity") BigDecimal quantity);

    @Update("UPDATE material_inventory SET locked_quantity = IFNULL(locked_quantity, 0) - #{quantity}, update_time = NOW() " +
            "WHERE id = #{id} AND IFNULL(locked_quantity, 0) >= #{quantity}")
    int unlockQuantity(@Param("id") Long id, @Param("quantity") BigDecimal quantity);

    @Select("SELECT * FROM material_inventory WHERE deleted = 0 AND (quantity <= warning_quantity OR (expiry_date IS NOT NULL AND expiry_date <= DATE_ADD(NOW(), INTERVAL 7 DAY)))")
    List<MaterialInventory> selectWarningInventory();

    @Select("SELECT * FROM material_inventory WHERE deleted = 0 AND moisture_proof_days > 0 AND production_date IS NOT NULL " +
            "AND DATE_ADD(production_date, INTERVAL moisture_proof_days DAY) <= DATE_ADD(NOW(), INTERVAL 7 DAY)")
    List<MaterialInventory> selectMoistureProofWarning();
}
