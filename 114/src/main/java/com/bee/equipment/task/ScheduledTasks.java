package com.bee.equipment.task;

import com.bee.equipment.service.CostStatisticsService;
import com.bee.equipment.service.MaterialService;
import com.bee.equipment.service.WorkOrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
public class ScheduledTasks {

    @Autowired
    private WorkOrderService workOrderService;

    @Autowired
    private MaterialService materialService;

    @Autowired
    private CostStatisticsService costStatisticsService;

    @Scheduled(cron = "0 0 * * * ?")
    public void checkTimeoutOrders() {
        workOrderService.suspendTimeoutOrders();
    }

    @Scheduled(cron = "0 0 8 * * ?")
    public void checkMaterialExpiry() {
        materialService.checkExpiryAndWarn();
    }

    @Scheduled(cron = "0 0 2 * * ?")
    public void generateDailyStatistics() {
        costStatisticsService.generateStatistics(LocalDate.now().minusDays(1));
    }
}
