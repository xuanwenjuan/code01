package com.construction.embedded.task;

import com.construction.embedded.service.MaterialService;
import com.construction.embedded.service.ProductionOrderService;
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
    private MaterialService materialService;

    @Scheduled(cron = "0 0 * * * ?")
    public void checkTimeoutOrders() {
        log.info("开始检查超期未投产的工单...");
        try {
            productionOrderService.checkTimeoutOrders();
            log.info("超期工单检查完成");
        } catch (Exception e) {
            log.error("检查超期工单失败", e);
        }
    }

    @Scheduled(cron = "0 0 8 * * ?")
    public void checkRustWarning() {
        log.info("开始检查潮湿环境原料的锈蚀预警...");
        try {
            materialService.checkRustWarning();
            log.info("锈蚀预警检查完成");
        } catch (Exception e) {
            log.error("检查锈蚀预警失败", e);
        }
    }
}
