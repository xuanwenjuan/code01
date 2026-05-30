package com.zongshi.brush.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.zongshi.brush.entity.BrushCategory;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface BrushCategoryMapper extends BaseMapper<BrushCategory> {

    List<BrushCategory> selectCategoryTree(@Param("parentId") Long parentId, @Param("status") Integer status);

    List<BrushCategory> selectChildrenById(@Param("id") Long id);
}
