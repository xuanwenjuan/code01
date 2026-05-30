package com.fastener.production.task;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.fastener.production.common.enums.WorkOrderStatusEnum;
import com.fastener.production.entity.workorder.ColdHeadingWorkOrder;
import com.fastener.production.mapper.workorder.ColdHeadingWorkOrderMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class WorkOrderTask {

    private final ColdHeadingWorkOrderMapper workOrderMapper;

    @Scheduled(cron = "0 0 2 * * ?")
    public void freezePendingWorkOrders() {
        log.info("开始执行：自动冻结长时间未启动的工单");

        LocalDateTime threshold = LocalDateTime.now().minusDays(7);

        LambdaQueryWrapper<ColdHeadingWorkOrder> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ColdHeadingWorkOrder::getStatus, WorkOrderStatusEnum.PENDING.getCode());
        wrapper.lt(ColdHeadingWorkOrder::getCreateTime, threshold);
        wrapper.eq(ColdHeadingWorkOrder::getDeleted, 0);

        List<ColdHeadingWorkOrder> orders = workOrderMapper.selectList(wrapper);

        for (ColdHeadingWorkOrder order : orders) {
            order.setStatus(WorkOrderStatusEnum.FROZEN.getCode());
            order.setRemark(order.getRemark() != null ? order.getRemark() + "; 系统自动冻结：工单超过7天未启动" : "系统自动冻结：工单超过7天未启动");
            workOrderMapper.updateById(order);
            log.info("工单【{}】已自动冻结", order.getOrderNo());
        }

        log.info("执行完成：自动冻结工单数量={}", orders.size());
    }

    @Scheduled(cron = "0 0 1 * * ?")
    public void checkExpiredWorkOrders() {
        log.info("开始执行：检查超期未完成的工单");

        LocalDateTime now = LocalDateTime.now();

        LambdaQueryWrapper<ColdHeadingWorkOrder> wrapper = new LambdaQueryWrapper<>();
        wrapper.in(ColdHeadingWorkOrder::getStatus,
                WorkOrderStatusEnum.CUTTING.getCode(),
                WorkOrderStatusEnum.COLD_HEADING.getCode(),
                WorkOrderStatusEnum.THREAD_ROLLING.getCode(),
                WorkOrderStatusEnum.GALVANIZING.getCode(),
                WorkOrderStatusEnum.QUENCHING.getCode(),
                WorkOrderStatusEnum.INSPECTION.getCode(),
                WorkOrderStatusEnum.PACKAGING.getCode());
        wrapper.eq(ColdHeadingWorkOrder::getDeleted, 0);

        List<ColdHeadingWorkOrder> orders = workOrderMapper.selectList(wrapper);

        int expiredCount = 0;
        for (ColdHeadingWorkOrder order : orders) {
            if (order.getPlanEndDate() != null && order.getPlanEndDate().atStartOfDay().isBefore(now.toLocalDate().atStartOfDay())) {
                log.warn("工单【{}】已超期，计划完成日期：{}", order.getOrderNo(), order.getPlanEndDate());
                expiredCount++;
            }
        }

        log.info("执行完成：超期工单数量={}", expiredCount);
    }
}
