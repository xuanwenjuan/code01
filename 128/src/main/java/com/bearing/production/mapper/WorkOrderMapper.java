package com.bearing.production.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.bearing.production.entity.WorkOrder;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface WorkOrderMapper extends BaseMapper<WorkOrder> {
}
