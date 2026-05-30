package com.leathercraft.task;

import com.leathercraft.service.ProcessingOrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class OrderTimeoutTask {

    private final ProcessingOrderService processingOrderService;

    @Scheduled(cron = "0 0 */1 * * ?")
    public void checkTimeoutOrders() {
        log.info("开始检查超时工单...");
        processingOrderService.suspendTimeoutOrders();
        log.info("超时工单检查完成");
    }
}
