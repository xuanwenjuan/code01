package com.fishing.distribution.service;

import cn.hutool.core.util.IdUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.fishing.distribution.dto.PageQuery;
import com.fishing.distribution.dto.RevenueItemDTO;
import com.fishing.distribution.entity.RevenueItem;
import com.fishing.distribution.entity.RevenueStatistics;
import com.fishing.distribution.exception.BusinessException;
import com.fishing.distribution.mapper.RevenueItemMapper;
import com.fishing.distribution.mapper.RevenueStatisticsMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RevenueService {

    private final RevenueStatisticsMapper revenueStatisticsMapper;
    private final RevenueItemMapper revenueItemMapper;

    @Transactional(rollbackFor = Exception.class)
    public void createRevenueItem(RevenueItemDTO dto, Long userId) {
        RevenueItem item = new RevenueItem();
        BeanUtils.copyProperties(dto, item);
        item.setItemNo("RI" + IdUtil.getSnowflakeNextIdStr());
        item.setCreateBy(userId);
        revenueItemMapper.insert(item);
    }

    public RevenueItem getRevenueItemById(Long id) {
        return revenueItemMapper.selectById(id);
    }

    public IPage<RevenueItem> getRevenueItemPage(PageQuery pageQuery, String itemType, String itemCategory, LocalDateTime startTime, LocalDateTime endTime) {
        Page<RevenueItem> page = new Page<>(pageQuery.getPageNum(), pageQuery.getPageSize());
        return revenueItemMapper.selectByCondition(page, itemType, itemCategory, startTime, endTime);
    }

    public List<RevenueItem> getRevenueItemsByOrderId(Long orderId) {
        return revenueItemMapper.selectByOrderId(orderId);
    }

    public List<RevenueStatistics> getRevenueStatistics(LocalDate startDate, LocalDate endDate, String statisticsType) {
        if (startDate == null) {
            startDate = LocalDate.now().withDayOfMonth(1);
        }
        if (endDate == null) {
            endDate = LocalDate.now();
        }
        if (statisticsType == null || statisticsType.isEmpty()) {
            statisticsType = "DAILY";
        }
        return revenueStatisticsMapper.selectByDateRange(startDate, endDate, statisticsType);
    }
}
