package com.liquor.brewing.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.liquor.brewing.entity.LiquorCategory;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface LiquorCategoryMapper extends BaseMapper<LiquorCategory> {

    @Select("SELECT * FROM liquor_category WHERE parent_id = #{parentId} AND deleted = 0 ORDER BY sort_order ASC")
    List<LiquorCategory> selectByParentId(Long parentId);
}
