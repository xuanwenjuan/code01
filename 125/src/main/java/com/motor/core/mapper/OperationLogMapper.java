package com.motor.core.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.motor.core.entity.po.OperationLogPO;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface OperationLogMapper extends BaseMapper<OperationLogPO> {
}
