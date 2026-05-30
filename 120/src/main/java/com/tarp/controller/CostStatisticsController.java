package com.tarp.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.tarp.annotation.OperationLog;
import com.tarp.annotation.RequireRole;
import com.tarp.common.RoleConstants;
import com.tarp.entity.CostStatistics;
import com.tarp.service.CostStatisticsService;
import com.tarp.vo.PageVO;
import com.tarp.vo.ResultVO;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/cost-statistics")
@RequiredArgsConstructor
public class CostStatisticsController {

    private final CostStatisticsService costStatisticsService;

    @GetMapping("/page")
    @RequireRole({RoleConstants.ROLE_ADMIN})
    public ResultVO<PageVO<CostStatistics>> page(
            @RequestParam(defaultValue = "1") int pageNum,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate
    ) {
        return ResultVO.success(costStatisticsService.page(pageNum, pageSize, startDate, endDate));
    }

    @GetMapping("/category")
    @RequireRole({RoleConstants.ROLE_ADMIN})
    public ResultVO<List<CostStatistics>> categoryStatistics(
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate
    ) {
        return ResultVO.success(costStatisticsService.getCategoryStatistics(startDate, endDate));
    }

    @PostMapping("/generate")
    @OperationLog("生成成本统计报表")
    @RequireRole({RoleConstants.ROLE_ADMIN})
    public ResultVO<Void> generateStatistics(
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate date
    ) {
        costStatisticsService.generateDailyStatistics(date);
        return ResultVO.success();
    }
}
