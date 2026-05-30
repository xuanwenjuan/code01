package com.paper.production.mapper.system;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.paper.production.entity.system.OperationLog;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface OperationLogMapper extends BaseMapper<OperationLog> {
}
