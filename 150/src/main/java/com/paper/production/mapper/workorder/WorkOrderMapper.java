package com.paper.production.mapper.workorder;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.paper.production.entity.workorder.WorkOrder;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface WorkOrderMapper extends BaseMapper<WorkOrder> {
}
