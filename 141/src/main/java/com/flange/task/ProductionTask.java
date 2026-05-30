package com.flange.task;

import com.flange.service.ProductionOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ProductionTask {

    private final ProductionOrderService orderService;

    @Scheduled(cron = "0 0 1 * * ?")
    public void checkOverdueOrders() {
        orderService.checkOverdueOrders();
    }
}
