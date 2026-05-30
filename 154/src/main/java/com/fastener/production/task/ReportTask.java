package com.fastener.production.task;

import com.fastener.production.service.cost.ProductionCostService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.YearMonth;

@Slf4j
@Component
@RequiredArgsConstructor
public class ReportTask {

    private final ProductionCostService productionCostService;

    @Scheduled(cron = "0 0 5 1 * ?")
    public void generateMonthlyReport() {
        log.info("开始执行：自动生成上月生产统计报表");

        YearMonth lastMonth = YearMonth.now().minusMonths(1);
        String reportMonth = lastMonth.toString();

        try {
            productionCostService.generateMonthlyReport(reportMonth);
            log.info("执行完成：已生成{}月份生产统计报表", reportMonth);
        } catch (Exception e) {
            log.error("生成{}月份生产统计报表失败：{}", reportMonth, e.getMessage(), e);
        }
    }
}
