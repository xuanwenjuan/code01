package com.naturaldye.task;

import com.naturaldye.service.DyeWorkOrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class WorkOrderTask {

    private final DyeWorkOrderService dyeWorkOrderService;

    @Scheduled(cron = "0 0 * * * ?")
    public void checkOverdueOrders() {
        log.info("开始执行超时工单检查任务");
        dyeWorkOrderService.checkAndPauseOverdueOrders();
        log.info("超时工单检查任务执行完成");
    }
}
