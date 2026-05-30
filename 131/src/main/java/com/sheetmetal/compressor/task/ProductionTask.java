package com.sheetmetal.compressor.task;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.sheetmetal.compressor.entity.ProductionOrder;
import com.sheetmetal.compressor.enums.OrderStatusEnum;
import com.sheetmetal.compressor.mapper.ProductionOrderMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@Component
public class ProductionTask {

    @Autowired
    private ProductionOrderMapper orderMapper;

    @Scheduled(cron = "0 0 2 * * ?")
    public void checkOverdueOrders() {
        log.info("开始检查超期未投产工单...");

        LocalDate today = LocalDate.now();
        List<ProductionOrder> orders = orderMapper.selectList(
            new LambdaQueryWrapper<ProductionOrder>()
                .in(ProductionOrder::getStatus,
                    OrderStatusEnum.PENDING_SCHEDULE.getCode(),
                    OrderStatusEnum.SCHEDULED.getCode())
                .lt(ProductionOrder::getPlanStartDate, today)
        );

        for (ProductionOrder order : orders) {
            order.setStatus(OrderStatusEnum.PAUSED.getCode());
            orderMapper.updateById(order);
            log.info("工单 {} 因超期未投产已暂停", order.getOrderNo());
        }

        log.info("检查超期未投产工单完成，共处理 {} 个", orders.size());
    }
}
