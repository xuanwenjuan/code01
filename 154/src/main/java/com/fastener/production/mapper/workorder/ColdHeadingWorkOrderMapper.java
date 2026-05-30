package com.fastener.production.mapper.workorder;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.fastener.production.entity.workorder.ColdHeadingWorkOrder;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface ColdHeadingWorkOrderMapper extends BaseMapper<ColdHeadingWorkOrder> {

    @Select("SELECT * FROM cold_heading_work_order WHERE order_no = #{orderNo} AND deleted = 0 LIMIT 1")
    ColdHeadingWorkOrder selectByOrderNo(@Param("orderNo") String orderNo);
}
