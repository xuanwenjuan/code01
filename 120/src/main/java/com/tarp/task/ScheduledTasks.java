package com.tarp.task;

import com.tarp.service.WorkOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ScheduledTasks {

    private final WorkOrderService workOrderService;

    @Scheduled(cron = "0 0 2 * * ?")
    public void pauseTimeoutOrders() {
        workOrderService.pauseTimeoutOrders();
    }
}
