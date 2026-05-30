package com.camping.task;

import com.camping.service.GroupOrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class OrderExpireTask {

    private final GroupOrderService groupOrderService;

    @Scheduled(cron = "0 0 1 * * ?")
    public void expireOrders() {
        log.info("开始执行超时订单自动失效任务");
        groupOrderService.expireOrders();
        log.info("超时订单自动失效任务执行完成");
    }

    @Scheduled(cron = "0 0 2 * * ?")
    public void autoCompleteOrders() {
        log.info("开始执行发货超期自动确认收货任务");
        groupOrderService.autoCompleteOrders();
        log.info("发货超期自动确认收货任务执行完成");
    }
}
