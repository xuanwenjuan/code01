package com.household.management.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.household.management.entity.ProductionWorkOrder;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.time.LocalDate;
import java.util.List;

@Mapper
public interface ProductionWorkOrderMapper extends BaseMapper<ProductionWorkOrder> {

    @Select("SELECT pwo.*, p.product_name, p.product_code, su.real_name as operator_name " +
            "FROM production_work_order pwo " +
            "LEFT JOIN product p ON pwo.product_id = p.id " +
            "LEFT JOIN sys_user su ON pwo.operator_id = su.id " +
            "WHERE pwo.deleted = 0 " +
            "ORDER BY pwo.priority DESC, pwo.create_time DESC")
    List<ProductionWorkOrder> selectWorkOrderList();

    @Select("SELECT pwo.*, p.product_name, p.product_code, su.real_name as operator_name " +
            "FROM production_work_order pwo " +
            "LEFT JOIN product p ON pwo.product_id = p.id " +
            "LEFT JOIN sys_user su ON pwo.operator_id = su.id " +
            "WHERE pwo.deleted = 0 AND pwo.id = #{id}")
    ProductionWorkOrder selectWorkOrderDetail(@Param("id") Long id);

    @Update("UPDATE production_work_order SET status = 3, is_auto_paused = 1, " +
            "update_time = NOW() WHERE status = 2 AND plan_end_date < #{today} AND deleted = 0")
    int autoPauseOverdueWorkOrders(@Param("today") LocalDate today);
}
