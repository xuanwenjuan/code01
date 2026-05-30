package com.hardware.stamping.task;

import com.hardware.stamping.service.MaterialInventoryService;
import com.hardware.stamping.service.ProductionOrderService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class ScheduledTasks {

    @Autowired
    private ProductionOrderService productionOrderService;

    @Autowired
    private MaterialInventoryService materialInventoryService;

    @Scheduled(cron = "0 0 */1 * * ?")
    public void checkTimeoutOrders() {
        log.info("开始检查超时未投产工单...");
        productionOrderService.checkTimeoutOrders();
        log.info("超时工单检查完成");
    }

    @Scheduled(cron = "0 0 8 * * ?")
    public void checkOxidationWarning() {
        log.info("开始检查易氧化原料仓储周期...");
        materialInventoryService.checkAndUpdateOxidationWarning();
        log.info("易氧化原料检查完成");
    }
}
