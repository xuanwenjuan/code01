package com.spring.manufacturing.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.spring.manufacturing.entity.WorkOrderMaterial;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface WorkOrderMaterialMapper extends BaseMapper<WorkOrderMaterial> {
}