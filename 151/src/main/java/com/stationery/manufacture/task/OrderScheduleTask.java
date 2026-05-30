package com.stationery.manufacture.task;

import com.stationery.manufacture.service.ProductionOrderService;
import com.stationery.manufacture.service.StockLockService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class OrderScheduleTask {

    private final ProductionOrderService orderService;
    private final StockLockService stockLockService;

    public OrderScheduleTask(ProductionOrderService orderService, StockLockService stockLockService) {
        this.orderService = orderService;
        this.stockLockService = stockLockService;
    }

    @Scheduled(cron = "0 0 2 * * ?")
    public void suspendOverdueOrders() {
        log.info("开始执行超期工单暂停任务");
        try {
            orderService.suspendOverdueOrders();
            log.info("超期工单暂停任务执行完成");
        } catch (Exception e) {
            log.error("超期工单暂停任务执行失败", e);
        }
    }

    @Scheduled(cron = "0 0 */6 * * ?")
    public void releaseExpiredLocks() {
        log.info("开始执行过期库存锁定释放任务");
        try {
            stockLockService.releaseExpiredLocks();
            log.info("过期库存锁定释放任务执行完成");
        } catch (Exception e) {
            log.error("过期库存锁定释放任务执行失败", e);
        }
    }
}
