package com.liquor.brewing.mapper;

import com.baomidou.mybatisplus.core.conditions.Wrapper;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.core.toolkit.Constants;
import com.liquor.brewing.entity.WorkOrder;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface WorkOrderMapper extends BaseMapper<WorkOrder> {

    @Select("SELECT w.*, f.formula_name, c.category_name, " +
            "u1.real_name as brewer_name, u2.real_name as supervisor_name, u3.real_name as inspector_name " +
            "FROM work_order w " +
            "LEFT JOIN liquor_formula f ON w.formula_id = f.id " +
            "LEFT JOIN liquor_category c ON w.category_id = c.id " +
            "LEFT JOIN sys_user u1 ON w.brewer_id = u1.id " +
            "LEFT JOIN sys_user u2 ON w.supervisor_id = u2.id " +
            "LEFT JOIN sys_user u3 ON w.inspector_id = u3.id " +
            "${ew.customSqlSegment}")
    IPage<WorkOrder> selectWorkOrderPage(IPage<WorkOrder> page, @Param(Constants.WRAPPER) Wrapper<WorkOrder> wrapper);
}
