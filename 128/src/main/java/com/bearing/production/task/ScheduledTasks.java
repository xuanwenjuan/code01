package com.bearing.production.task;

import com.bearing.production.entity.Material;
import com.bearing.production.entity.WorkOrder;
import com.bearing.production.service.MaterialService;
import com.bearing.production.service.WorkOrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class ScheduledTasks {

    private final WorkOrderService workOrderService;
    private final MaterialService materialService;

    @Scheduled(cron = "0 0 2 * * ?")
    public void suspendExpiredOrders() {
        log.info("开始执行超期工单自动暂停任务...");
        try {
            List<WorkOrder> expiredOrders = workOrderService.getExpiredPendingOrders();
            for (WorkOrder order : expiredOrders) {
                log.info("工单{}已超期未投产，自动暂停", order.getOrderNo());
                workOrderService.suspendWorkOrder(order.getId());
            }
            log.info("超期工单自动暂停任务完成，共处理{}个工单", expiredOrders.size());
        } catch (Exception e) {
            log.error("超期工单自动暂停任务执行失败", e);
        }
    }

    @Scheduled(cron = "0 0 9 * * ?")
    public void rustProofReminder() {
        log.info("开始执行钢材防锈提醒任务...");
        try {
            List<Material> reminderList = materialService.getRustProofReminderList();
            if (!reminderList.isEmpty()) {
                log.warn("有{}批钢材需要进行防锈处理：", reminderList.size());
                for (Material material : reminderList) {
                    log.warn("批次号：{}，原料名称：{}，下次防锈时间：{}",
                            material.getBatchNo(),
                            material.getMaterialName(),
                            material.getNextRustProofTime());
                }
            } else {
                log.info("暂无需要防锈处理的钢材");
            }
        } catch (Exception e) {
            log.error("钢材防锈提醒任务执行失败", e);
        }
    }
}
