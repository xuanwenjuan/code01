package com.incense.task;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.incense.entity.ProductionOrder;
import com.incense.service.ProductionOrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class ScheduledTasks {

    private final ProductionOrderService productionOrderService;

    @Scheduled(cron = "0 0 2 * * ?")
    public void freezeOverdueOrders() {
        log.info("开始检查超时工单...");
        LambdaQueryWrapper<ProductionOrder> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ProductionOrder::getStatus, "PENDING")
                .lt(ProductionOrder::getCreateTime, LocalDateTime.now().minusHours(24));
        List<ProductionOrder> orders = productionOrderService.list(wrapper);
        for (ProductionOrder order : orders) {
            try {
                productionOrderService.freezeOrder(order.getId(), "工单超时未启动，自动冻结");
                log.info("工单 {} 已自动冻结", order.getOrderNo());
            } catch (Exception e) {
                log.error("冻结工单 {} 失败: {}", order.getOrderNo(), e.getMessage());
            }
        }
        log.info("超时工单检查完成，共处理 {} 个工单", orders.size());
    }
}
