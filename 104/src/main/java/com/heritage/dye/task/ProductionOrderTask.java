package com.heritage.dye.task;

import com.heritage.dye.service.ProductionOrderService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class ProductionOrderTask {

    @Autowired
    private ProductionOrderService productionOrderService;

    @Scheduled(cron = "0 0 2 * * ?")
    public void freezeTimeoutOrders() {
        log.info("开始执行超时工单冻结任务");
        try {
            productionOrderService.freezeTimeoutOrders();
            log.info("超时工单冻结任务执行完成");
        } catch (Exception e) {
            log.error("超时工单冻结任务执行失败", e);
        }
    }
}
