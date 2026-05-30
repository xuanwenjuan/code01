package com.fishing.distribution.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.fishing.distribution.entity.SortingLossRecord;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface SortingLossRecordMapper extends BaseMapper<SortingLossRecord> {

    List<SortingLossRecord> selectByOrderId(@Param("orderId") Long orderId);
}
