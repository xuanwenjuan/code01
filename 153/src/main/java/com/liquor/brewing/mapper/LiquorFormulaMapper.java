package com.liquor.brewing.mapper;

import com.baomidou.mybatisplus.core.conditions.Wrapper;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.core.toolkit.Constants;
import com.liquor.brewing.entity.LiquorFormula;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface LiquorFormulaMapper extends BaseMapper<LiquorFormula> {

    @Select("SELECT f.*, c.category_name, c.category_code FROM liquor_formula f " +
            "LEFT JOIN liquor_category c ON f.category_id = c.id " +
            "${ew.customSqlSegment}")
    IPage<LiquorFormula> selectFormulaPage(IPage<LiquorFormula> page, @Param(Constants.WRAPPER) Wrapper<LiquorFormula> wrapper);
}
