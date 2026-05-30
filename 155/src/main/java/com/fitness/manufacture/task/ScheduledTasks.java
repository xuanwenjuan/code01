package com.fitness.manufacture.task;

import com.fitness.manufacture.service.MaterialBatchService;
import com.fitness.manufacture.service.MaterialService;
import com.fitness.manufacture.service.MonthlyProductionReportService;
import com.fitness.manufacture.service.WorkOrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class ScheduledTasks {

    private final MaterialService materialService;
    private final MaterialBatchService materialBatchService;
    private final WorkOrderService workOrderService;
    private final MonthlyProductionReportService monthlyProductionReportService;

    @Scheduled(cron = "0 0 8 * * ?")
    public void checkStockWarning() {
        log.info("开始执行库存预警检查任务");
        try {
            materialService.checkStockWarning();
            log.info("库存预警检查任务执行完成");
        } catch (Exception e) {
            log.error("库存预警检查任务执行失败", e);
        }
    }

    @Scheduled(cron = "0 0 9 * * ?")
    public void checkExpiryWarning() {
        log.info("开始执行物料过期预警检查任务");
        try {
            materialBatchService.checkExpiryWarning();
            log.info("物料过期预警检查任务执行完成");
        } catch (Exception e) {
            log.error("物料过期预警检查任务执行失败", e);
        }
    }

    @Scheduled(cron = "0 0 2 * * ?")
    public void autoFreezeWorkOrders() {
        log.info("开始执行工单自动冻结任务");
        try {
            workOrderService.autoFreezeWorkOrders();
            log.info("工单自动冻结任务执行完成");
        } catch (Exception e) {
            log.error("工单自动冻结任务执行失败", e);
        }
    }

    @Scheduled(cron = "0 0 4 1 * ?")
    public void generateMonthlyReport() {
        log.info("开始执行月度报表自动生成任务");
        try {
            monthlyProductionReportService.generateLastMonthReport();
            log.info("月度报表自动生成任务执行完成");
        } catch (Exception e) {
            log.error("月度报表自动生成任务执行失败", e);
        }
    }
}
