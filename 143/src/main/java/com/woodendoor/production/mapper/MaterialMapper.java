package com.woodendoor.production.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.woodendoor.production.entity.Material;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface MaterialMapper extends BaseMapper<Material> {
}