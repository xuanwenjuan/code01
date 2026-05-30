package com.motor.core.task;

import com.motor.core.service.ProductionOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ProductionTask {
    private final ProductionOrderService productionOrderService;

    @Scheduled(cron = "0 0 1 * * ?")
    public void autoSuspendTimeoutOrders() {
        productionOrderService.autoSuspendTimeoutOrders();
    }
}
