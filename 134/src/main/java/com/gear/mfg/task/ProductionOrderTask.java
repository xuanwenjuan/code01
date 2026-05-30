package com.gear.mfg.task;

import com.gear.mfg.service.ProductionOrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class ProductionOrderTask {

    private final ProductionOrderService productionOrderService;

    @Scheduled(cron = "0 0 1 * * ?")
    public void checkTimeoutOrders() {
        log.info("开始检查超期未开工工单...");
        try {
            productionOrderService.pauseTimeoutOrders();
            log.info("超期未开工工单检查完成");
        } catch (Exception e) {
            log.error("超期未开工工单检查失败", e);
        }
    }
}