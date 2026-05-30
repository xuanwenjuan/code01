package com.fastener.production.mapper.system;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.fastener.production.entity.system.OperationLog;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface OperationLogMapper extends BaseMapper<OperationLog> {
}
