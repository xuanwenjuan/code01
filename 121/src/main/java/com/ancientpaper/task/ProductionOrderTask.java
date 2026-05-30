package com.ancientpaper.task;

import com.ancientpaper.context.UserContext;
import com.ancientpaper.entity.ProductionOrder;
import com.ancientpaper.mapper.ProductionOrderMapper;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class ProductionOrderTask {

    private final ProductionOrderMapper orderMapper;

    @Scheduled(cron = "0 0/30 * * * ?")
    public void checkTimeoutOrders() {
        try {
            log.info("开始检查超时未处理的工单");
            LocalDateTime timeoutTime = LocalDateTime.now().minusHours(24);
            
            List<ProductionOrder> timeoutOrders = orderMapper.selectList(new LambdaQueryWrapper<ProductionOrder>()
                    .eq(ProductionOrder::getStatus, 2)
                    .lt(ProductionOrder::getSoakStartTime, timeoutTime));
            
            for (ProductionOrder order : timeoutOrders) {
                order.setStatus(15);
                orderMapper.updateById(order);
                log.info("工单{}超时未捣料，已自动冻结", order.getOrderNo());
            }
            
            log.info("超时工单检查完成，共处理{}个工单", timeoutOrders.size());
        } catch (Exception e) {
            log.error("超时工单检查异常", e);
        } finally {
            UserContext.clear();
        }
    }
}