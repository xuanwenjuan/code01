package com.construction.material.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.construction.material.entity.MaterialWorkOrder;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.time.LocalDateTime;
import java.util.List;

@Mapper
public interface MaterialWorkOrderMapper extends BaseMapper<MaterialWorkOrder> {

    @Select("SELECT * FROM material_work_order WHERE deleted = 0 AND status = 3 AND plan_use_date <= DATE_ADD(NOW(), INTERVAL 3 DAY)")
    List<MaterialWorkOrder> selectPendingVerifyOrders();

    @Select("SELECT * FROM material_work_order WHERE deleted = 0 AND status IN (1, 2, 3) AND plan_use_date <= #{expireTime}")
    List<MaterialWorkOrder> selectOverdueOrders(@Param("expireTime") LocalDateTime expireTime);
}
