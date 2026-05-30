package com.spring.manufacturing.task;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.spring.manufacturing.entity.ProductionWorkOrder;
import com.spring.manufacturing.mapper.ProductionWorkOrderMapper;
import com.spring.manufacturing.service.ProductionCostService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class ScheduledTasks {

    private final ProductionWorkOrderMapper workOrderMapper;
    private final ProductionCostService productionCostService;

    @Scheduled(cron = "0 0 2 * * ?")
    public void checkOverdueWorkOrders() {
        log.info("开始检查超期未排产的工单...");
        LocalDate today = LocalDate.now();
        LambdaQueryWrapper<ProductionWorkOrder> wrapper = new LambdaQueryWrapper<>();
        wrapper.and(w -> w.ne(ProductionWorkOrder::getStatus, "FINISHED")
                        .ne(ProductionWorkOrder::getStatus, "PAUSED"))
                .lt(ProductionWorkOrder::getPlanStartDate, today);

        List<ProductionWorkOrder> overdueOrders = workOrderMapper.selectList(wrapper);
        int pausedCount = 0;
        for (ProductionWorkOrder order : overdueOrders) {
            if (!"PAUSED".equals(order.getStatus())) {
                order.setStatus("PAUSED");
                order.setProcessOperatorId(null);
                order.setUpdateTime(LocalDateTime.now());
                workOrderMapper.updateById(order);
                pausedCount++;
                log.info("工单号 {} 已因超期未排产被自动暂停", order.getWorkOrderNo());
            }
        }
        log.info("超期工单检查完成，共处理 {} 个超期工单", pausedCount);
    }

    @Scheduled(cron = "0 0 3 1 * ?")
    public void generateLastMonthCostReport() {
        log.info("开始自动生成上月生产成本报表...");
        LocalDate today = LocalDate.now();
        LocalDate lastMonth = today.minusMonths(1);
        String month = lastMonth.format(java.time.format.DateTimeFormatter.ofPattern("yyyy-MM"));

        try {
            productionCostService.generateMonthlyReport(month);
            log.info("上月 {} 生产成本报表生成成功", month);
        } catch (Exception e) {
            log.error("生成上月生产成本报表失败", e);
        }
    }
}