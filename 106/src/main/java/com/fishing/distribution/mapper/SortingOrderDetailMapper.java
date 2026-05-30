package com.fishing.distribution.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.fishing.distribution.entity.SortingOrderDetail;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface SortingOrderDetailMapper extends BaseMapper<SortingOrderDetail> {

    List<SortingOrderDetail> selectByOrderId(@Param("orderId") Long orderId);
}
