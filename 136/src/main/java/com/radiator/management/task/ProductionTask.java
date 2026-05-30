package com.radiator.management.task;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.radiator.management.entity.ProductionWorkOrder;
import com.radiator.management.mapper.ProductionWorkOrderMapper;
import com.radiator.management.service.ProductionCostService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class ProductionTask {

    private final ProductionWorkOrderMapper workOrderMapper;
    private final ProductionCostService productionCostService;

    @Scheduled(cron = "0 0 1 * * ?")
    public void checkOverdueWorkOrders() {
        log.info("开始检查超期未排产的工单");
        
        LocalDate today = LocalDate.now();
        List<ProductionWorkOrder> orders = workOrderMapper.selectList(
            new LambdaQueryWrapper<ProductionWorkOrder>()
                .eq(ProductionWorkOrder::getStatus, "PENDING")
        );

        for (ProductionWorkOrder order : orders) {
            if (order.getPlanStartDate() != null && order.getPlanStartDate().isBefore(today)) {
                order.setStatus("PAUSED");
                workOrderMapper.updateById(order);
                log.info("工单 {} 因超期未排产已暂停", order.getOrderNo());
            }
        }
        log.info("超期工单检查完成");
    }

    @Scheduled(cron = "0 0 2 1 * ?")
    public void generateLastMonthReport() {
        log.info("开始生成上月生产报表");
        
        LocalDate lastMonth = LocalDate.now().minusMonths(1);
        String month = lastMonth.format(DateTimeFormatter.ofPattern("yyyy-MM"));
        
        productionCostService.generateMonthlyReport(month);
        
        log.info("上月生产报表 {} 生成完成", month);
    }
}