package com.horncomb.task;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.horncomb.common.Constants;
import com.horncomb.entity.HornMaterial;
import com.horncomb.entity.ProductionWorkOrder;
import com.horncomb.mapper.HornMaterialMapper;
import com.horncomb.mapper.ProductionWorkOrderMapper;
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
    private final HornMaterialMapper hornMaterialMapper;

    @Scheduled(cron = "0 0 2 * * ?")
    public void suspendTimeoutWorkOrders() {
        log.info("开始执行超时工单自动搁置任务");
        LocalDateTime timeoutTime = LocalDateTime.now().minusDays(7);

        List<ProductionWorkOrder> timeoutOrders = workOrderMapper.selectList(
                new LambdaQueryWrapper<ProductionWorkOrder>()
                        .in(ProductionWorkOrder::getStatus,
                                Constants.ORDER_STATUS_PENDING,
                                Constants.ORDER_STATUS_CUTTING,
                                Constants.ORDER_STATUS_GRINDING,
                                Constants.ORDER_STATUS_CARVING,
                                Constants.ORDER_STATUS_POLISHING,
                                Constants.ORDER_STATUS_TRIMMING,
                                Constants.ORDER_STATUS_INSPECTING)
                        .lt(ProductionWorkOrder::getCreateTime, timeoutTime)
        );

        for (ProductionWorkOrder order : timeoutOrders) {
            order.setStatus(Constants.ORDER_STATUS_SUSPENDED);
            workOrderMapper.updateById(order);
            log.info("工单 {} 因超时已自动搁置", order.getOrderNo());
        }

        log.info("超时工单自动搁置任务执行完成，共处理 {} 个工单", timeoutOrders.size());
    }

    @Scheduled(cron = "0 0 9 * * ?")
    public void checkMaterialExpireRemind() {
        log.info("开始执行原料到期提醒检查任务");
        LocalDate today = LocalDate.now();
        LocalDate remindDate = today.plusDays(7);

        List<HornMaterial> materials = hornMaterialMapper.selectList(
                new LambdaQueryWrapper<HornMaterial>()
                        .isNotNull(HornMaterial::getExpireRemindDate)
                        .le(HornMaterial::getExpireRemindDate, remindDate)
                        .ne(HornMaterial::getStockStatus, Constants.STOCK_STATUS_OUT)
        );

        for (HornMaterial material : materials) {
            log.warn("原料批次 {} 将在 {} 到期，请及时处理",
                    material.getBatchNo(),
                    material.getExpireRemindDate());
        }

        log.info("原料到期提醒检查任务执行完成，共发现 {} 个即将到期的原料", materials.size());
    }

    @Scheduled(cron = "0 0 3 * * ?")
    public void checkLowStockWarning() {
        log.info("开始执行库存预警检查任务");

        List<HornMaterial> materials = hornMaterialMapper.selectList(
                new LambdaQueryWrapper<HornMaterial>()
                        .ne(HornMaterial::getStockStatus, Constants.STOCK_STATUS_OUT)
        );

        int warningCount = 0;
        for (HornMaterial material : materials) {
            if (material.getQuantity() <= material.getWarningQuantity()) {
                warningCount++;
                log.warn("原料批次 {} 库存不足，当前库存：{}，预警阈值：{}",
                        material.getBatchNo(),
                        material.getQuantity(),
                        material.getWarningQuantity());
            }
        }

        log.info("库存预警检查任务执行完成，共发现 {} 个库存不足的原料", warningCount);
    }
}
