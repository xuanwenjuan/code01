package com.spring.manufacturing.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.spring.manufacturing.entity.WorkOrderProcess;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface WorkOrderProcessMapper extends BaseMapper<WorkOrderProcess> {
}