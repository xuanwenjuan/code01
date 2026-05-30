package com.mining.maintenance.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mining.maintenance.entity.OperationLog;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface OperationLogMapper extends BaseMapper<OperationLog> {
}