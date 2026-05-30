package com.snacktrace.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.snacktrace.entity.Material;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface MaterialMapper extends BaseMapper<Material> {
}
