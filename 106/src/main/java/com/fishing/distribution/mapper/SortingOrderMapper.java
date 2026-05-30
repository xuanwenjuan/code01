package com.fishing.distribution.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.fishing.distribution.entity.SortingOrder;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDateTime;
import java.util.List;

@Mapper
public interface SortingOrderMapper extends BaseMapper<SortingOrder> {

    List<SortingOrder> selectTimeoutOrders(@Param("warningTime") LocalDateTime warningTime);
}
