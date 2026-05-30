package com.construction.material.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.construction.material.entity.WorkOrderDetail;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface WorkOrderDetailMapper extends BaseMapper<WorkOrderDetail> {

    @Select("SELECT * FROM work_order_detail WHERE work_order_id = #{workOrderId} AND deleted = 0")
    List<WorkOrderDetail> selectByWorkOrderId(@Param("workOrderId") Long workOrderId);
}
