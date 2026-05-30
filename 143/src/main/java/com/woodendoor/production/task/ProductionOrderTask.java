package com.woodendoor.production.task;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.woodendoor.production.entity.ProductionOrder;
import com.woodendoor.production.mapper.ProductionOrderMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
public class ProductionOrderTask {

    private final ProductionOrderMapper productionOrderMapper;

    @Scheduled(cron = "0 0 1 * * ?")
    public void checkOverdueOrders() {
        List<ProductionOrder> overdueOrders = productionOrderMapper.selectList(
                new LambdaQueryWrapper<ProductionOrder>()
                        .eq(ProductionOrder::getStatus, 1)
                        .lt(ProductionOrder::getPlanStartDate, LocalDateTime.now())
        );

        for (ProductionOrder order : overdueOrders) {
            order.setStatus(4);
            productionOrderMapper.updateById(order);
        }
    }
}