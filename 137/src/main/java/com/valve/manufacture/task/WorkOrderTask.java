package com.valve.manufacture.task;

import com.valve.manufacture.service.WorkOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class WorkOrderTask {

    private final WorkOrderService workOrderService;

    @Scheduled(cron = "0 0 1 * * ?")
    public void checkOverdueOrders() {
        workOrderService.checkOverdueOrders();
    }
}
