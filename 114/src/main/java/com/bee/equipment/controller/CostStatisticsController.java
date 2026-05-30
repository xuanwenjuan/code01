package com.bee.equipment.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.bee.equipment.annotation.OperationLog;
import com.bee.equipment.annotation.RequireRole;
import com.bee.equipment.common.Result;
import com.bee.equipment.common.RoleEnum;
import com.bee.equipment.dto.CostStatisticsDTO;
import com.bee.equipment.entity.CostStatistics;
import com.bee.equipment.service.CostStatisticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/cost-statistics")
public class CostStatisticsController {

    @Autowired
    private CostStatisticsService costStatisticsService;

    @GetMapping("/page")
    @RequireRole(RoleEnum.ADMIN)
    public Result<Page<CostStatistics>> listWithPage(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return Result.success(costStatisticsService.listWithPage(page, size, categoryId, startDate, endDate));
    }

    @PostMapping("/generate")
    @RequireRole(RoleEnum.ADMIN)
    @OperationLog(module = "成本统计", description = "生成成本统计")
    public Result<Void> generateStatistics(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        costStatisticsService.generateStatistics(date);
        return Result.success("统计生成成功", null);
    }
}
