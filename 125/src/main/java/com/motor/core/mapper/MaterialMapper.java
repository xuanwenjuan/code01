package com.motor.core.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.motor.core.dto.MaterialQueryDTO;
import com.motor.core.entity.po.MaterialPO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.math.BigDecimal;

@Mapper
public interface MaterialMapper extends BaseMapper<MaterialPO> {

    Page<MaterialPO> queryByConditions(Page<MaterialPO> page, @Param("query") MaterialQueryDTO query);

    @Select("SELECT quantity - IFNULL(locked_quantity, 0) FROM material WHERE id = #{id} FOR UPDATE")
    BigDecimal getAvailableQuantityForUpdate(@Param("id") Long id);

    int lockMaterialStock(@Param("id") Long id, @Param("quantity") BigDecimal quantity);

    int unlockMaterialStock(@Param("id") Long id, @Param("quantity") BigDecimal quantity);

    int deductMaterialStock(@Param("id") Long id, @Param("quantity") BigDecimal quantity);
}
