package com.fishing.distribution.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.fishing.distribution.entity.FishingBoat;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDate;
import java.util.List;

@Mapper
public interface FishingBoatMapper extends BaseMapper<FishingBoat> {

    List<FishingBoat> selectBoatsWithExpiringLicense(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
}
