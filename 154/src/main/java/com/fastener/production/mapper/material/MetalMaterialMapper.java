package com.fastener.production.mapper.material;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.fastener.production.entity.material.MetalMaterial;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface MetalMaterialMapper extends BaseMapper<MetalMaterial> {

    @Select("SELECT * FROM metal_material WHERE material_code = #{materialCode} AND deleted = 0 LIMIT 1")
    MetalMaterial selectByCode(@Param("materialCode") String materialCode);

    @Select("SELECT * FROM metal_material WHERE material_type = #{materialType} AND deleted = 0 ORDER BY create_time DESC")
    List<MetalMaterial> selectByType(@Param("materialType") Integer materialType);
}
