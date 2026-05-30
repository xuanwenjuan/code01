package com.household.management.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.household.management.entity.WorkOrderProcess;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface WorkOrderProcessMapper extends BaseMapper<WorkOrderProcess> {

    @Select("SELECT wop.*, su.real_name as operator_name " +
            "FROM work_order_process wop " +
            "LEFT JOIN sys_user su ON wop.operator_id = su.id " +
            "WHERE wop.work_order_id = #{workOrderId} " +
            "ORDER BY wop.id")
    List<WorkOrderProcess> selectByWorkOrderId(@Param("workOrderId") Long workOrderId);
}
