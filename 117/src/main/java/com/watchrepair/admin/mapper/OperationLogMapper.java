package com.watchrepair.admin.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.watchrepair.admin.entity.OperationLog;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface OperationLogMapper extends BaseMapper<OperationLog> {
}