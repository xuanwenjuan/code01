package com.battery.shell.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.battery.shell.entity.OperationLog;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface OperationLogMapper extends BaseMapper<OperationLog> {
}
