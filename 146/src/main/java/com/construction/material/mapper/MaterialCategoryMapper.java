package com.construction.material.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.construction.material.entity.MaterialCategory;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface MaterialCategoryMapper extends BaseMapper<MaterialCategory> {

    @Select("SELECT * FROM material_category WHERE parent_id = #{parentId} AND deleted = 0 ORDER BY sort_order ASC, priority DESC")
    List<MaterialCategory> selectByParentId(@Param("parentId") Long parentId);

    @Select("SELECT * FROM material_category WHERE deleted = 0 ORDER BY sort_order ASC, priority DESC")
    List<MaterialCategory> selectAllTree();
}
