package com.mining.maintenance.task;

import com.mining.maintenance.service.MaintenanceOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class MaintenanceScheduledTask {

    private final MaintenanceOrderService maintenanceOrderService;

    @Scheduled(fixedRate = 60000)
    public void reassignTimeoutOrders() {
        maintenanceOrderService.reassignTimeoutOrders();
    }
}