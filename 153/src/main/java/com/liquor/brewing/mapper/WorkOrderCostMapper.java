package com.liquor.brewing.mapper;

import com.baomidou.mybatisplus.core.conditions.Wrapper;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.core.toolkit.Constants;
import com.liquor.brewing.entity.WorkOrderCost;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface WorkOrderCostMapper extends BaseMapper<WorkOrderCost> {

    @Select("SELECT wc.*, w.order_no, w.order_name FROM work_order_cost wc " +
            "LEFT JOIN work_order w ON wc.work_order_id = w.id " +
            "${ew.customSqlSegment}")
    IPage<WorkOrderCost> selectCostPage(IPage<WorkOrderCost> page, @Param(Constants.WRAPPER) Wrapper<WorkOrderCost> wrapper);
}
