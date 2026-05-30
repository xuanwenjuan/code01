package com.aromatherapy.mapper;

import com.aromatherapy.entity.WorkOrderFormula;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;
import java.util.List;

@Mapper
public interface WorkOrderFormulaMapper extends BaseMapper<WorkOrderFormula> {

    @Select("SELECT * FROM work_order_formula WHERE work_order_id = #{workOrderId} AND deleted = 0")
    List<WorkOrderFormula> selectByWorkOrderId(Long workOrderId);
}
