package com.liquor.brewing.mapper;

import com.baomidou.mybatisplus.core.conditions.Wrapper;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.core.toolkit.Constants;
import com.liquor.brewing.entity.Material;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface MaterialMapper extends BaseMapper<Material> {

    @Select("SELECT m.*, t.type_name, t.type_code, IFNULL(SUM(b.quantity), 0) as total_stock " +
            "FROM material m " +
            "LEFT JOIN material_type t ON m.type_id = t.id " +
            "LEFT JOIN material_batch b ON m.id = b.material_id AND b.status = 1 AND b.deleted = 0 " +
            "${ew.customSqlSegment} " +
            "GROUP BY m.id")
    IPage<Material> selectMaterialPage(IPage<Material> page, @Param(Constants.WRAPPER) Wrapper<Material> wrapper);

    @Select("SELECT IFNULL(SUM(quantity), 0) FROM material_batch " +
            "WHERE material_id = #{materialId} AND status = 1 AND deleted = 0")
    BigDecimal getTotalStock(@Param("materialId") Long materialId);
}
