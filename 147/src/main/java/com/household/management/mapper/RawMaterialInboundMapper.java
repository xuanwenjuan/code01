package com.household.management.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.household.management.entity.RawMaterialInbound;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface RawMaterialInboundMapper extends BaseMapper<RawMaterialInbound> {

    @Select("SELECT rmi.*, rm.material_name, rm.material_code, rm.material_type, su.real_name as auditor_name " +
            "FROM raw_material_inbound rmi " +
            "LEFT JOIN raw_material rm ON rmi.material_id = rm.id " +
            "LEFT JOIN sys_user su ON rmi.auditor_id = su.id " +
            "WHERE rmi.deleted = 0 " +
            "ORDER BY rmi.create_time DESC")
    List<RawMaterialInbound> selectInboundList();

    @Select("SELECT rmi.*, rm.material_name, rm.material_code, rm.material_type, su.real_name as auditor_name " +
            "FROM raw_material_inbound rmi " +
            "LEFT JOIN raw_material rm ON rmi.material_id = rm.id " +
            "LEFT JOIN sys_user su ON rmi.auditor_id = su.id " +
            "WHERE rmi.deleted = 0 AND rmi.id = #{id}")
    RawMaterialInbound selectInboundDetail(@Param("id") Long id);
}
