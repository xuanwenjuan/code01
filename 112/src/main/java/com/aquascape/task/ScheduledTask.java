package com.aquascape.task;

import com.aquascape.entity.CustomOrder;
import com.aquascape.mapper.CustomOrderMapper;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
public class ScheduledTask {

    @Autowired
    private CustomOrderMapper orderMapper;

    @Scheduled(cron = "0 0 2 * * ?")
    public void autoSuspendOrders() {
        log.info("开始执行自动搁置超时工单任务");

        LocalDateTime threshold = LocalDateTime.now().minusDays(3);
        List<CustomOrder> orders = orderMapper.selectList(
                new LambdaQueryWrapper<CustomOrder>()
                        .eq(CustomOrder::getOrderStatus, 1)
                        .lt(CustomOrder::getCreateTime, threshold)
        );

        for (CustomOrder order : orders) {
            order.setOrderStatus(0);
            orderMapper.updateById(order);
            log.info("工单 {} 已自动搁置", order.getOrderNo());
        }

        log.info("自动搁置超时工单任务完成，共处理 {} 个工单", orders.size());
    }
}
