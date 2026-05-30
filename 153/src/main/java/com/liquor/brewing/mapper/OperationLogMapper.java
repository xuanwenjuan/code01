package com.liquor.brewing.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.liquor.brewing.entity.OperationLog;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface OperationLogMapper extends BaseMapper<OperationLog> {
}
