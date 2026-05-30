package com.bee.equipment.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.bee.equipment.entity.CostStatistics;

import java.time.LocalDate;

public interface CostStatisticsService extends IService<CostStatistics> {

    Page<CostStatistics> listWithPage(int page, int size, Long categoryId, LocalDate startDate, LocalDate endDate);

    void generateStatistics(LocalDate date);
}
