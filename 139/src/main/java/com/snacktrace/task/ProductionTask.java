package com.snacktrace.task;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.snacktrace.entity.Material;
import com.snacktrace.entity.MaterialBatch;
import com.snacktrace.entity.ProductionWorkOrder;
import com.snacktrace.enums.MaterialStatusEnum;
import com.snacktrace.enums.WorkOrderStatusEnum;
import com.snacktrace.service.MaterialBatchService;
import com.snacktrace.service.MaterialService;
import com.snacktrace.service.ProductionWorkOrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Component
public class ProductionTask {

    @Autowired
    private ProductionWorkOrderService workOrderService;

    @Autowired
    private MaterialBatchService batchService;

    @Autowired
    private MaterialService materialService;

    @Scheduled(cron = "0 0 1 * * ?")
    public void checkOverdueWorkOrders() {
        LocalDateTime now = LocalDateTime.now();
        LambdaQueryWrapper<ProductionWorkOrder> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ProductionWorkOrder::getStatus, WorkOrderStatusEnum.PENDING.getCode())
               .lt(ProductionWorkOrder::getPlanStartTime, now.minusDays(1));
        List<ProductionWorkOrder> overdueOrders = workOrderService.list(wrapper);
        
        for (ProductionWorkOrder order : overdueOrders) {
            order.setStatus(WorkOrderStatusEnum.SHELVED.getCode());
            workOrderService.updateById(order);
        }
    }

    @Scheduled(cron = "0 0 2 * * ?")
    public void checkExpiringMaterials() {
        LocalDate today = LocalDate.now();
        LocalDate warningDate = today.plusDays(3);
        
        LambdaQueryWrapper<MaterialBatch> wrapper = new LambdaQueryWrapper<>();
        wrapper.in(MaterialBatch::getStatus, 1, 2)
               .le(MaterialBatch::getExpireDate, warningDate);
        List<MaterialBatch> expiringBatches = batchService.list(wrapper);
        
        for (MaterialBatch batch : expiringBatches) {
            if (batch.getExpireDate().isBefore(today)) {
                batch.setStatus(4);
            }
        }
        if (!expiringBatches.isEmpty()) {
            batchService.updateBatchById(expiringBatches);
        }
    }

    @Scheduled(cron = "0 0 3 * * ?")
    public void updateMaterialStatus() {
        List<Material> materials = materialService.list();
        for (Material material : materials) {
            if (material.getQuantity().compareTo(material.getWarningQuantity()) <= 0) {
                if (material.getQuantity().compareTo(java.math.BigDecimal.ZERO) <= 0) {
                    material.setStatus(MaterialStatusEnum.SUSPEND.getCode());
                } else {
                    material.setStatus(MaterialStatusEnum.WARNING.getCode());
                }
            } else {
                material.setStatus(MaterialStatusEnum.SUFFICIENT.getCode());
            }
            materialService.updateById(material);
        }
    }
}
