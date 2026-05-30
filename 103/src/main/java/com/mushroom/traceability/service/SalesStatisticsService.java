package com.mushroom.traceability.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.mushroom.traceability.entity.SalesStatistics;
import com.mushroom.traceability.mapper.SalesStatisticsMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SalesStatisticsService extends ServiceImpl<SalesStatisticsMapper, SalesStatistics> {

    public List<SalesStatistics> listByDateRange(LocalDate startDate, LocalDate endDate) {
        LambdaQueryWrapper<SalesStatistics> wrapper = new LambdaQueryWrapper<>();
        if (startDate != null) {
            wrapper.ge(SalesStatistics::getStatisticsDate, startDate);
        }
        if (endDate != null) {
            wrapper.le(SalesStatistics::getStatisticsDate, endDate);
        }
        wrapper.orderByDesc(SalesStatistics::getStatisticsDate);
        return list(wrapper);
    }

    public List<SalesStatistics> listByCategory(Long categoryId) {
        LambdaQueryWrapper<SalesStatistics> wrapper = new LambdaQueryWrapper<>();
        if (categoryId != null) {
            wrapper.eq(SalesStatistics::getCategoryId, categoryId);
        }
        wrapper.orderByDesc(SalesStatistics::getStatisticsDate);
        return list(wrapper);
    }

    public List<SalesStatistics> listByArea(Long areaId) {
        LambdaQueryWrapper<SalesStatistics> wrapper = new LambdaQueryWrapper<>();
        if (areaId != null) {
            wrapper.eq(SalesStatistics::getAreaId, areaId);
        }
        wrapper.orderByDesc(SalesStatistics::getStatisticsDate);
        return list(wrapper);
    }
}