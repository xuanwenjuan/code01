package com.amber.customize.task;

import com.amber.customize.service.CustomOrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class OrderExpireTask {

    private final CustomOrderService customOrderService;

    @Scheduled(cron = "0 0 2 * * ?")
    public void expirePendingOrders() {
        log.info("开始执行超时订单失效任务");
        try {
            customOrderService.expirePendingOrders();
            log.info("超时订单失效任务执行完成");
        } catch (Exception e) {
            log.error("超时订单失效任务执行失败", e);
        }
    }

}