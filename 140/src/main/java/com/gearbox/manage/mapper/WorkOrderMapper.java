package com.gearbox.manage.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.gearbox.manage.entity.WorkOrder;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface WorkOrderMapper extends BaseMapper<WorkOrder> {
}
