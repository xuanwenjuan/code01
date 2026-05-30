package com.instrument.consignment.task;

import com.instrument.consignment.service.RefurbishWorkOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ScheduledTasks {

    private final RefurbishWorkOrderService workOrderService;

    @Scheduled(cron = "0 0 */1 * * ?")
    public void processTimeoutOrders() {
        workOrderService.shelveTimeoutOrders();
    }
}
