package com.aromatherapy.task;

import com.aromatherapy.entity.ProductionWorkOrder;
import com.aromatherapy.enums.WorkOrderStatusEnum;
import com.aromatherapy.mapper.ProductionWorkOrderMapper;
import com.aromatherapy.service.RawMaterialService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class ScheduledTask {

    private final ProductionWorkOrderMapper workOrderMapper;
    private final RawMaterialService rawMaterialService;

    @Scheduled(cron = "0 0 */1 * * ?")
    @Transactional(rollbackFor = Exception.class)
    public void autoSuspendExpiredPendingOrders() {
        log.info("开始执行超时未确认配方工单自动暂停任务...");

        LocalDateTime expireTime = LocalDateTime.now().minusHours(24);
        List<ProductionWorkOrder> expiredOrders = workOrderMapper.selectList(
                new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<ProductionWorkOrder>()
                        .eq(ProductionWorkOrder::getStatus, WorkOrderStatusEnum.PENDING.getCode())
                        .le(ProductionWorkOrder::getCreateTime, expireTime)
        );

        for (ProductionWorkOrder order : expiredOrders) {
            order.setStatus(WorkOrderStatusEnum.SUSPENDED.getCode());
            order.setRemark(order.getRemark() == null ? "超时未确认配方，自动暂停" : order.getRemark() + "; 超时未确认配方，自动暂停");
            workOrderMapper.updateById(order);
            log.info("工单 {} 已自动暂停", order.getOrderNo());
        }

        log.info("超时工单自动暂停任务执行完成，共处理 {} 个工单", expiredOrders.size());
    }

    @Scheduled(cron = "0 0 2 * * ?")
    @Transactional(rollbackFor = Exception.class)
    public void checkAndUpdateMaterialStatus() {
        log.info("开始执行原料状态检查任务...");

        rawMaterialService.checkAndUpdateExpiredStatus();
        rawMaterialService.checkAndUpdateExpiringSoonStatus();

        log.info("原料状态检查任务执行完成");
    }

    @Scheduled(cron = "0 0 9 * * ?")
    public void sendStockWarningNotification() {
        log.info("开始执行库存预警通知任务...");

        var warningList = rawMaterialService.getWarningStockList();
        if (!warningList.isEmpty()) {
            log.warn("库存预警：以下原料库存不足，共 {} 种", warningList.size());
            warningList.forEach(material ->
                    log.warn("原料: {}, 批次: {}, 当前库存: {}, 预警阈值: {}",
                            material.getMaterialName(),
                            material.getBatchCode(),
                            material.getStockQuantity(),
                            material.getWarningQuantity())
            );
        }

        var expiringList = rawMaterialService.getExpiringSoonList(30);
        if (!expiringList.isEmpty()) {
            log.warn("临期预警：以下原料即将过期，共 {} 种", expiringList.size());
            expiringList.forEach(material ->
                    log.warn("原料: {}, 批次: {}, 过期日期: {}",
                            material.getMaterialName(),
                            material.getBatchCode(),
                            material.getExpiryDate())
            );
        }

        log.info("库存预警通知任务执行完成");
    }
}
