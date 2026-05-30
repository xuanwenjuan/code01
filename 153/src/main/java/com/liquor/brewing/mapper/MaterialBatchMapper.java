package com.liquor.brewing.mapper;

import com.baomidou.mybatisplus.core.conditions.Wrapper;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.core.toolkit.Constants;
import com.liquor.brewing.entity.MaterialBatch;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface MaterialBatchMapper extends BaseMapper<MaterialBatch> {

    @Select("SELECT b.*, m.material_name, m.material_code, m.unit FROM material_batch b " +
            "LEFT JOIN material m ON b.material_id = m.id " +
            "${ew.customSqlSegment}")
    IPage<MaterialBatch> selectBatchPage(IPage<MaterialBatch> page, @Param(Constants.WRAPPER) Wrapper<MaterialBatch> wrapper);
}
