package com.logistics.bigcargo.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.logistics.bigcargo.entity.OperationLog;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface OperationLogMapper extends BaseMapper<OperationLog> {
}
