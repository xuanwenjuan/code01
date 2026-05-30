package com.oiledumbrella.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.oiledumbrella.entity.CustomOrder;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface CustomOrderMapper extends BaseMapper<CustomOrder> {
}
