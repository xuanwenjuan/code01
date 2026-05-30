package com.hydraulic.piston.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.hydraulic.piston.entity.OperationLog;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface OperationLogMapper extends BaseMapper<OperationLog> {
}
