package com.cosmetics.task;

import com.cosmetics.service.MaterialBatchService;
import com.cosmetics.service.WorkOrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class ScheduledTask {

    private final MaterialBatchService materialBatchService;
    private final WorkOrderService workOrderService;

    @Scheduled(cron = "0 0 1 * * ?")
    public void updateExpiredMaterial() {
        log.info("开始执行原料过期状态更新任务");
        try {
            materialBatchService.updateExpiredStatus();
            log.info("原料过期状态更新任务执行完成");
        } catch (Exception e) {
            log.error("原料过期状态更新任务执行失败", e);
        }
    }

    @Scheduled(cron = "0 0 2 * * ?")
    public void autoSuspendOverdueWorkOrders() {
        log.info("开始执行超期工单自动暂停任务");
        try {
            workOrderService.autoSuspendOverdue();
            log.info("超期工单自动暂停任务执行完成");
        } catch (Exception e) {
            log.error("超期工单自动暂停任务执行失败", e);
        }
    }

    @Scheduled(cron = "0 0 9 * * ?")
    public void checkExpiringMaterials() {
        log.info("开始检查即将到期的原料");
        try {
            materialBatchService.getExpiringBatches(30);
            log.info("即将到期原料检查完成");
        } catch (Exception e) {
            log.error("即将到期原料检查失败", e);
        }
    }
}
