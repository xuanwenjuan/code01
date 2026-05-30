package com.mushroom.traceability.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mushroom.traceability.entity.OperationLog;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface OperationLogMapper extends BaseMapper<OperationLog> {
}