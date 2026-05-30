package com.fishing.distribution.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.fishing.distribution.common.Result;
import com.fishing.distribution.dto.PageQuery;
import com.fishing.distribution.dto.RevenueItemDTO;
import com.fishing.distribution.entity.RevenueItem;
import com.fishing.distribution.entity.RevenueStatistics;
import com.fishing.distribution.service.RevenueService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/revenue")
@RequiredArgsConstructor
public class RevenueController {

    private final RevenueService revenueService;

    @PostMapping("/item")
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE')")
    public Result<Void> createRevenueItem(@Valid @RequestBody RevenueItemDTO dto) {
        revenueService.createRevenueItem(dto, 1L);
        return Result.success("创建成功");
    }

    @GetMapping("/item/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE')")
    public Result<RevenueItem> getRevenueItemById(@PathVariable Long id) {
        return Result.success(revenueService.getRevenueItemById(id));
    }

    @GetMapping("/item/page")
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE')")
    public Result<IPage<RevenueItem>> getRevenueItemPage(
            PageQuery pageQuery,
            @RequestParam(required = false) String itemType,
            @RequestParam(required = false) String itemCategory,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime startTime,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime endTime) {
        return Result.success(revenueService.getRevenueItemPage(pageQuery, itemType, itemCategory, startTime, endTime));
    }

    @GetMapping("/item/order/{orderId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE')")
    public Result<List<RevenueItem>> getRevenueItemsByOrderId(@PathVariable Long orderId) {
        return Result.success(revenueService.getRevenueItemsByOrderId(orderId));
    }

    @GetMapping("/statistics")
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE')")
    public Result<List<RevenueStatistics>> getRevenueStatistics(
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate,
            @RequestParam(required = false) String statisticsType) {
        return Result.success(revenueService.getRevenueStatistics(startDate, endDate, statisticsType));
    }
}
