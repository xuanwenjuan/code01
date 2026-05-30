package com.aluminum.extrusion.task;

import com.aluminum.extrusion.service.WorkOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class WorkOrderScheduledTask {

    private final WorkOrderService workOrderService;

    @Scheduled(cron = "0 0 2 * * ?")
    public void pauseOverdueOrders() {
        workOrderService.pauseOverdueOrders();
    }
}
