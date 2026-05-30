package com.foundry.impeller.task;

import com.foundry.impeller.entity.ProductionWorkOrder;
import com.foundry.impeller.service.ProductionWorkOrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class ProductionScheduledTask {

    private final ProductionWorkOrderService workOrderService;

    @Scheduled(cron = "0 0 2 * * ?")
    public void freezeTimeoutPendingOrders() {
        log.info("开始执行超时工单冻结任务");
        List<ProductionWorkOrder> timeoutOrders = workOrderService.getPendingTimeoutOrders();
        for (ProductionWorkOrder order : timeoutOrders) {
            try {
                workOrderService.freezeOrder(order.getId());
                log.info("冻结超时工单成功，工单号：{}", order.getWorkOrderNo());
            } catch (Exception e) {
                log.error("冻结超时工单失败，工单号：{}", order.getWorkOrderNo(), e);
            }
        }
        log.info("超时工单冻结任务执行完成，共处理{}个工单", timeoutOrders.size());
    }
}
