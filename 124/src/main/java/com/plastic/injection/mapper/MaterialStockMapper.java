package com.plastic.injection.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.plastic.injection.po.MaterialStockPO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Update;

import java.math.BigDecimal;

@Mapper
public interface MaterialStockMapper extends BaseMapper<MaterialStockPO> {

    IPage<MaterialStockPO> selectByConditions(Page<MaterialStockPO> page,
                                               @Param("materialName") String materialName,
                                               @Param("materialCode") String materialCode,
                                               @Param("stockStatus") Integer stockStatus,
                                               @Param("isHygroscopic") Integer isHygroscopic);

    @Update("UPDATE material_stock SET locked_quantity = locked_quantity + #{quantity}, " +
            "update_time = NOW(), update_by = #{operator} WHERE id = #{id} AND deleted = 0 " +
            "AND quantity - locked_quantity >= #{quantity}")
    int lockStock(@Param("id") Long id, @Param("quantity") BigDecimal quantity, @Param("operator") String operator);

    @Update("UPDATE material_stock SET locked_quantity = locked_quantity - #{quantity}, " +
            "quantity = quantity - #{actualQuantity}, update_time = NOW(), update_by = #{operator} " +
            "WHERE id = #{id} AND deleted = 0 AND locked_quantity >= #{quantity}")
    int unlockAndConsumeStock(@Param("id") Long id, @Param("quantity") BigDecimal quantity,
                               @Param("actualQuantity") BigDecimal actualQuantity, @Param("operator") String operator);

    @Update("UPDATE material_stock SET locked_quantity = locked_quantity - #{quantity}, " +
            "update_time = NOW(), update_by = #{operator} WHERE id = #{id} AND deleted = 0 AND locked_quantity >= #{quantity}")
    int unlockStock(@Param("id") Long id, @Param("quantity") BigDecimal quantity, @Param("operator") String operator);
}
