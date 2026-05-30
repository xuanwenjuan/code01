package com.watchrepair.admin.task;

import com.watchrepair.admin.service.RevenueStatisticsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Slf4j
@Component
@RequiredArgsConstructor
public class StatisticsTask {

    private final RevenueStatisticsService statisticsService;

    @Scheduled(cron = "0 0 2 * * ?")
    public void generateDailyStatistics() {
        LocalDate yesterday = LocalDate.now().minusDays(1);
        log.info("开始生成{}的营收统计数据", yesterday);
        try {
            statisticsService.generateDailyStatistics(yesterday);
            log.info("{}的营收统计数据生成完成", yesterday);
        } catch (Exception e) {
            log.error("生成营收统计数据失败", e);
        }
    }
}