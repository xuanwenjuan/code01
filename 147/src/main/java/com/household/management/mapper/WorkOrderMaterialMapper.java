package com.household.management.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.household.management.entity.WorkOrderMaterial;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface WorkOrderMaterialMapper extends BaseMapper<WorkOrderMaterial> {

    @Select("SELECT wom.*, rm.material_name, rm.material_code, rm.unit " +
            "FROM work_order_material wom " +
            "LEFT JOIN raw_material rm ON wom.material_id = rm.id " +
            "WHERE wom.work_order_id = #{workOrderId} " +
            "ORDER BY wom.id")
    List<WorkOrderMaterial> selectByWorkOrderId(@Param("workOrderId") Long workOrderId);
}
