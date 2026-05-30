package com.firecontrol.task;

import com.firecontrol.service.WorkOrderService;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class WorkOrderScheduleTask {

    @Resource
    private WorkOrderService workOrderService;

    @Scheduled(cron = "0 0 2 * * ?")
    public void autoPauseOverdueOrders() {
        log.info("开始执行工单自动暂停定时任务");
        try {
            workOrderService.autoPauseOverdueOrders();
            log.info("工单自动暂停定时任务执行完成");
        } catch (Exception e) {
            log.error("工单自动暂停定时任务执行失败", e);
        }
    }
}
