package com.household.management.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.household.management.entity.QualityInspection;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface QualityInspectionMapper extends BaseMapper<QualityInspection> {

    @Select("SELECT qi.*, su.real_name as inspector_name, p.product_name, rm.material_name, pwo.work_order_no " +
            "FROM quality_inspection qi " +
            "LEFT JOIN sys_user su ON qi.inspector_id = su.id " +
            "LEFT JOIN product p ON qi.product_id = p.id " +
            "LEFT JOIN raw_material rm ON qi.material_id = rm.id " +
            "LEFT JOIN production_work_order pwo ON qi.work_order_id = pwo.id " +
            "WHERE qi.deleted = 0 " +
            "ORDER BY qi.create_time DESC")
    List<QualityInspection> selectInspectionList();

    @Select("SELECT qi.*, su.real_name as inspector_name, p.product_name, rm.material_name, pwo.work_order_no " +
            "FROM quality_inspection qi " +
            "LEFT JOIN sys_user su ON qi.inspector_id = su.id " +
            "LEFT JOIN product p ON qi.product_id = p.id " +
            "LEFT JOIN raw_material rm ON qi.material_id = rm.id " +
            "LEFT JOIN production_work_order pwo ON qi.work_order_id = pwo.id " +
            "WHERE qi.deleted = 0 AND qi.id = #{id}")
    QualityInspection selectInspectionDetail(@Param("id") Long id);
}
