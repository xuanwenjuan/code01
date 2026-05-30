package com.fastener.production.mapper.workorder;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.fastener.production.entity.workorder.WorkOrderProcess;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface WorkOrderProcessMapper extends BaseMapper<WorkOrderProcess> {

    @Select("SELECT * FROM work_order_process WHERE work_order_id = #{workOrderId} AND deleted = 0 ORDER BY id ASC")
    List<WorkOrderProcess> selectByWorkOrderId(@Param("workOrderId") Long workOrderId);

    @Select("SELECT * FROM work_order_process WHERE work_order_id = #{workOrderId} AND process_code = #{processCode} AND deleted = 0 LIMIT 1")
    WorkOrderProcess selectByWorkOrderIdAndProcessCode(@Param("workOrderId") Long workOrderId, @Param("processCode") String processCode);
}
