package com.watchrepair.admin.task;

import com.watchrepair.admin.entity.RepairWorkOrder;
import com.watchrepair.admin.service.RepairWorkOrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class WorkOrderTask {

    private final RepairWorkOrderService workOrderService;

    @Scheduled(cron = "0 0 */1 * * ?")
    public void checkTimeoutWorkOrders() {
        List<RepairWorkOrder> timeoutOrders = workOrderService.getTimeoutWorkOrders();
        if (!timeoutOrders.isEmpty()) {
            log.warn("发现{}个超时未拆解的工单", timeoutOrders.size());
            for (RepairWorkOrder order : timeoutOrders) {
                log.warn("工单编号: {}, 客户: {}, 接收时间: {}",
                        order.getOrderNo(), order.getCustomerName(), order.getReceivedTime());
            }
        }
    }
}