package com.fan.impeller.task;

import com.fan.impeller.service.MaterialService;
import com.fan.impeller.service.PurchaseOrderService;
import com.fan.impeller.service.WorkOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ScheduledTasks {

    private final WorkOrderService workOrderService;
    private final MaterialService materialService;
    private final PurchaseOrderService purchaseOrderService;

    @Scheduled(cron = "0 0 1 * * ?")
    public void suspendTimeoutOrders() {
        workOrderService.suspendTimeoutOrders();
    }

    @Scheduled(cron = "0 0 2 * * ?")
    public void checkMaterialExpiry() {
        materialService.checkAndUpdateExpiryStatus();
    }

    @Scheduled(cron = "0 0 3 * * ?")
    public void autoCreatePurchaseOrders() {
        purchaseOrderService.autoCreatePurchaseOrders();
    }
}
