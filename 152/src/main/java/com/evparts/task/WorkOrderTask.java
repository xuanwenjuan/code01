package com.evparts.task;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.evparts.entity.WorkOrder;
import com.evparts.mapper.WorkOrderMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
public class WorkOrderTask {

    @Autowired
    private WorkOrderMapper workOrderMapper;

    @Value("${task.work-order.over-due-hours:72}")
    private Integer overDueHours;

    @Scheduled(cron = "${task.work-order.auto-suspend-cron:0 0 2 * * ?}")
    public void autoSuspendOverdueOrders() {
        log.info("开始执行超期未投产工单自动暂停任务");

        LocalDateTime deadline = LocalDateTime.now().minusHours(overDueHours);

        List<WorkOrder> overdueOrders = workOrderMapper.selectList(
                new LambdaQueryWrapper<WorkOrder>()
                        .eq(WorkOrder::getOrderStatus, "PENDING")
                        .lt(WorkOrder::getCreateTime, deadline)
        );

        int suspendedCount = 0;
        for (WorkOrder order : overdueOrders) {
            order.setOrderStatus("SUSPENDED");
            order.setRemark(order.getRemark() != null ?
                    order.getRemark() + "; 系统自动暂停：超期未投产" :
                    "系统自动暂停：超期未投产");
            workOrderMapper.updateById(order);
            suspendedCount++;
            log.info("工单{}已自动暂停", order.getOrderNo());
        }

        log.info("超期未投产工单自动暂停任务执行完成，共暂停{}个工单", suspendedCount);
    }

}
