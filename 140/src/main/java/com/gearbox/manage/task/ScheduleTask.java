package com.gearbox.manage.task;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.gearbox.manage.entity.MaterialBatch;
import com.gearbox.manage.entity.WorkOrder;
import com.gearbox.manage.service.MaterialBatchService;
import com.gearbox.manage.service.WorkOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
@RequiredArgsConstructor
public class ScheduleTask {

    private final WorkOrderService workOrderService;
    private final MaterialBatchService materialBatchService;

    @Scheduled(cron = "0 0 1 * * ?")
    public void checkOverdueWorkOrders() {
        LocalDate today = LocalDate.now();
        List<WorkOrder> overdueOrders = workOrderService.list(
            new LambdaQueryWrapper<WorkOrder>()
                .eq(WorkOrder::getStatus, "PENDING")
                .lt(WorkOrder::getPlanStartDate, today)
        );

        for (WorkOrder order : overdueOrders) {
            order.setStatus("PAUSED");
            workOrderService.updateById(order);
        }
    }

    @Scheduled(cron = "0 0 2 * * ?")
    public void checkExpiringMaterials() {
        LocalDate today = LocalDate.now();
        LocalDate warningDate = today.plusDays(7);

        List<MaterialBatch> expiringBatches = materialBatchService.list(
            new LambdaQueryWrapper<MaterialBatch>()
                .eq(MaterialBatch::getStatus, "NORMAL")
                .le(MaterialBatch::getExpirationDate, warningDate)
                .ge(MaterialBatch::getExpirationDate, today)
        );

        for (MaterialBatch batch : expiringBatches) {
            batch.setStatus("EXPIRING");
            materialBatchService.updateById(batch);
        }

        List<MaterialBatch> expiredBatches = materialBatchService.list(
            new LambdaQueryWrapper<MaterialBatch>()
                .eq(MaterialBatch::getStatus, "EXPIRING")
                .lt(MaterialBatch::getExpirationDate, today)
        );

        for (MaterialBatch batch : expiredBatches) {
            batch.setStatus("EXPIRED");
            materialBatchService.updateById(batch);
        }
    }
}
