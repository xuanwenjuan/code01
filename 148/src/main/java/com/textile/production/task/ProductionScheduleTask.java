package com.textile.production.task;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.textile.production.common.ProcessConstants;
import com.textile.production.entity.ProductionOrder;
import com.textile.production.entity.RawMaterial;
import com.textile.production.entity.RawMaterialBatch;
import com.textile.production.service.ProductionLogService;
import com.textile.production.service.ProductionOrderService;
import com.textile.production.service.RawMaterialBatchService;
import com.textile.production.service.RawMaterialService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class ProductionScheduleTask {

    private final ProductionOrderService orderService;
    private final RawMaterialService materialService;
    private final RawMaterialBatchService batchService;
    private final ProductionLogService logService;

    @Scheduled(cron = "0 0 8 * * ?")
    @Transactional(rollbackFor = Exception.class)
    public void checkTimeoutOrders() {
        log.info("开始检查超期未开工工单");

        LambdaQueryWrapper<ProductionOrder> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ProductionOrder::getStatus, ProcessConstants.ORDER_STATUS_PENDING)
                .le(ProductionOrder::getPlanStartDate, LocalDate.now().minusDays(1));

        List<ProductionOrder> orders = orderService.list(wrapper);

        for (ProductionOrder order : orders) {
            String beforeStatus = order.getStatus();
            order.setStatus(ProcessConstants.ORDER_STATUS_SUSPENDED);
            order.setTimeout(1);
            orderService.updateById(order);

            logService.log(order.getId(), null, "系统暂停",
                    "工单超期未开工，系统自动暂停", beforeStatus, order.getStatus());

            log.info("工单{}已超期，自动暂停", order.getOrderNo());
        }

        log.info("超期未开工工单检查完成，共处理{}个工单", orders.size());
    }

    @Scheduled(cron = "0 30 8 * * ?")
    @Transactional(rollbackFor = Exception.class)
    public void updateMaterialStatus() {
        log.info("开始更新原料库存状态");

        List<RawMaterial> materials = materialService.list();

        for (RawMaterial material : materials) {
            String newStatus = materialService.calculateStatus(
                    material.getTotalQuantity(), material.getWarningQuantity());

            if (!newStatus.equals(material.getStatus())) {
                String oldStatus = material.getStatus();
                material.setStatus(newStatus);
                materialService.updateById(material);
                log.info("原料{}状态从{}更新为{}", material.getName(), oldStatus, newStatus);
            }
        }

        log.info("原料库存状态更新完成");
    }

    @Scheduled(cron = "0 0 9,15 * * ?")
    @Transactional(rollbackFor = Exception.class)
    public void checkMoistureWarning() {
        log.info("开始检查防潮仓储提醒");

        LambdaQueryWrapper<RawMaterialBatch> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(RawMaterialBatch::getStatus, 1)
                .eq(RawMaterialBatch::getMoistureWarning, 0);

        List<RawMaterialBatch> batches = batchService.list(wrapper);

        int warningCount = 0;
        for (RawMaterialBatch batch : batches) {
            RawMaterial material = materialService.getById(batch.getMaterialId());
            if (material != null && material.getMoistureProof() == 1
                    && batch.getHumidity() != null
                    && batch.getHumidity().compareTo(new BigDecimal("60")) > 0) {
                batch.setMoistureWarning(1);
                batchService.updateById(batch);
                warningCount++;
                log.warn("批次{}湿度{}%超过阈值，触发防潮提醒", batch.getBatchCode(), batch.getHumidity());
            }
        }

        log.info("防潮仓储提醒检查完成，新增{}个预警批次", warningCount);
    }

    @Scheduled(cron = "0 0 10 * * ?")
    public void generateDailyReport() {
        log.info("开始生成每日生产报表");

        LocalDate today = LocalDate.now();

        LambdaQueryWrapper<ProductionOrder> dayWrapper = new LambdaQueryWrapper<>();
        dayWrapper.ge(ProductionOrder::getCreateTime, today.atStartOfDay());
        long newOrderCount = orderService.count(dayWrapper);

        LambdaQueryWrapper<ProductionOrder> completeWrapper = new LambdaQueryWrapper<>();
        completeWrapper.eq(ProductionOrder::getStatus, ProcessConstants.ORDER_STATUS_COMPLETED)
                .ge(ProductionOrder::getActualEndDate, today.atStartOfDay());
        long completeOrderCount = orderService.count(completeWrapper);

        LambdaQueryWrapper<ProductionOrder> inProgressWrapper = new LambdaQueryWrapper<>();
        inProgressWrapper.eq(ProductionOrder::getStatus, ProcessConstants.ORDER_STATUS_IN_PROGRESS);
        long inProgressCount = orderService.count(inProgressWrapper);

        log.info("每日生产报表: 新开工单{}个, 完成工单{}个, 进行中工单{}个",
                newOrderCount, completeOrderCount, inProgressCount);
    }
}
