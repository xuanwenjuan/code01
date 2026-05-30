package com.snack.processing.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.snack.processing.entity.WorkOrder;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface WorkOrderMapper extends BaseMapper<WorkOrder> {
}
