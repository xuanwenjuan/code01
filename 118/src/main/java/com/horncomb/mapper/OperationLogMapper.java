package com.horncomb.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.horncomb.entity.OperationLogEntity;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface OperationLogMapper extends BaseMapper<OperationLogEntity> {
}
