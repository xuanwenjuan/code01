package com.zongshi.brush.task;

import com.zongshi.brush.service.ProductionOrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class OrderTimeoutTask {

    private final ProductionOrderService productionOrderService;

    @Scheduled(cron = "0 0/30 * * * ?")
    public void processTimeoutOrders() {
        log.info("开始执行工单超时检查任务");
        try {
            productionOrderService.processTimeoutOrders();
            log.info("工单超时检查任务执行完成");
        } catch (Exception e) {
            log.error("工单超时检查任务执行失败", e);
        }
    }
}
