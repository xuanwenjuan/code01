package com.snack.processing.task;

import com.snack.processing.service.StatisticsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Slf4j
@Component
@RequiredArgsConstructor
public class StatisticsTask {

    private final StatisticsService statisticsService;

    @Scheduled(cron = "0 30 2 * * ?")
    public void generateDailyReport() {
        log.info("开始自动生成日报表...");
        try {
            LocalDate yesterday = LocalDate.now().minusDays(1);
            statisticsService.generateDailyStatistics(yesterday);
            log.info("日报表生成成功，日期：{}", yesterday);
        } catch (Exception e) {
            log.error("日报表生成失败", e);
        }
    }

    @Scheduled(cron = "0 0 4 1 * ?")
    public void generateMonthlyReport() {
        log.info("开始自动生成月报表...");
        try {
            LocalDate lastMonth = LocalDate.now().minusMonths(1);
            statisticsService.generateMonthlyStatistics(lastMonth.getYear(), lastMonth.getMonthValue());
            log.info("月报表生成成功，日期：{}年{}月", lastMonth.getYear(), lastMonth.getMonthValue());
        } catch (Exception e) {
            log.error("月报表生成失败", e);
        }
    }
}
