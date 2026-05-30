package com.zongshi.brush.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.zongshi.brush.entity.MaterialArchive;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface MaterialArchiveMapper extends BaseMapper<MaterialArchive> {

    List<MaterialArchive> selectWarningMaterials();

    List<MaterialArchive> selectExpiringMoistureMaterials(@Param("days") Integer days);
}
