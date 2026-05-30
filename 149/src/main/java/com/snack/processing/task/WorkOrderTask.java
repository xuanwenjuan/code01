package com.snack.processing.task;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.snack.processing.common.enums.ProcessStatusEnum;
import com.snack.processing.common.enums.WorkOrderStatusEnum;
import com.snack.processing.entity.WorkOrder;
import com.snack.processing.entity.WorkOrderProcess;
import com.snack.processing.mapper.WorkOrderMapper;
import com.snack.processing.mapper.WorkOrderProcessMapper;
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
public class WorkOrderTask {

    private final WorkOrderMapper workOrderMapper;
    private final WorkOrderProcessMapper processMapper;

    @Scheduled(cron = "0 0 2 * * ?")
    @Transactional(rollbackFor = Exception.class)
    public void checkOverdueWorkOrders() {
        log.info("开始检查逾期工单...");

        LocalDateTime now = LocalDateTime.now();
        List<WorkOrder> overdueOrders = workOrderMapper.selectList(new LambdaQueryWrapper<WorkOrder>()
                .in(WorkOrder::getStatus,
                        WorkOrderStatusEnum.PENDING.getCode(),
                        WorkOrderStatusEnum.IN_PRODUCTION.getCode(),
                        WorkOrderStatusEnum.QC_INSPECTION.getCode())
                .lt(WorkOrder::getPlanEndTime, now)
                .eq(WorkOrder::getIsOverdue, 0));

        for (WorkOrder order : overdueOrders) {
            try {
                order.setIsOverdue(1);
                order.setStatus(WorkOrderStatusEnum.PAUSED.getCode());
                workOrderMapper.updateById(order);

                List<WorkOrderProcess> processes = processMapper.selectList(new LambdaQueryWrapper<WorkOrderProcess>()
                        .eq(WorkOrderProcess::getWorkOrderId, order.getId())
                        .eq(WorkOrderProcess::getStatus, ProcessStatusEnum.IN_PROGRESS.getCode()));

                for (WorkOrderProcess process : processes) {
                    process.setStatus(ProcessStatusEnum.PENDING.getCode());
                    process.setStartTime(null);
                    processMapper.updateById(process);
                }

                log.info("工单[{}]已逾期，自动暂停", order.getOrderNo());
            } catch (Exception e) {
                log.error("处理逾期工单[{}]失败", order.getOrderNo(), e);
            }
        }

        log.info("逾期工单检查完成，共处理{}个工单", overdueOrders.size());
    }
}
