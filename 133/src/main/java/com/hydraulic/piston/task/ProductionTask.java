package com.hydraulic.piston.task;

import com.hydraulic.piston.service.ProductionOrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class ProductionTask {

    private final ProductionOrderService productionOrderService;

    @Scheduled(cron = "0 0 2 * * ?")
    public void checkOverdueOrders() {
        log.info("开始执行超期工单检查定时任务");
        try {
            productionOrderService.checkAndPauseOverdueOrders();
            log.info("超期工单检查定时任务执行完成");
        } catch (Exception e) {
            log.error("超期工单检查定时任务执行失败", e);
        }
    }
}
