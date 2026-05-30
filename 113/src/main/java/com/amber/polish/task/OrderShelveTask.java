package com.amber.polish.task;

import com.amber.polish.service.PolishOrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class OrderShelveTask {

    private final PolishOrderService polishOrderService;

    @Scheduled(cron = "0 0 3 * * ?")
    public void shelveOverdueOrders() {
        log.info("开始执行超时工单自动搁置定时任务");
        try {
            polishOrderService.shelveOverdueOrders();
            log.info("超时工单自动搁置定时任务执行完成");
        } catch (Exception e) {
            log.error("超时工单自动搁置定时任务执行异常", e);
        }
    }
}
