package com.fishing.distribution.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.fishing.distribution.entity.RevenueItem;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDateTime;
import java.util.List;

@Mapper
public interface RevenueItemMapper extends BaseMapper<RevenueItem> {

    IPage<RevenueItem> selectByCondition(
            Page<RevenueItem> page,
            @Param("itemType") String itemType,
            @Param("itemCategory") String itemCategory,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime);

    List<RevenueItem> selectByOrderId(@Param("orderId") Long orderId);
}
