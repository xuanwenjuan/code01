package com.liquor.brewing.task;

import com.liquor.brewing.service.CostService;
import com.liquor.brewing.service.MaterialReservationService;
import com.liquor.brewing.service.WorkOrderService;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class ScheduledTasks {

    @Resource
    private WorkOrderService workOrderService;

    @Resource
    private CostService costService;

    @Resource
    private MaterialReservationService reservationService;

    @Scheduled(cron = "0 0 2 * * ?")
    public void autoFreezeWorkOrders() {
        log.info("开始执行自动冻结超时工单任务");
        try {
            workOrderService.autoFreezeWorkOrders();
            log.info("自动冻结超时工单任务执行完成");
        } catch (Exception e) {
            log.error("自动冻结超时工单任务执行失败", e);
        }
    }

    @Scheduled(cron = "0 0 3 1 * ?")
    public void generateMonthlyCostStatistics() {
        log.info("开始执行月度成本报表生成任务");
        try {
            costService.generateMonthlyStatistics();
            log.info("月度成本报表生成任务执行完成");
        } catch (Exception e) {
            log.error("月度成本报表生成任务执行失败", e);
        }
    }

    @Scheduled(cron = "0 0 8 * * ?")
    public void checkMaterialExpire() {
        log.info("开始执行物料到期检查任务");
        try {
            log.info("物料到期检查任务执行完成");
        } catch (Exception e) {
            log.error("物料到期检查任务执行失败", e);
        }
    }

    @Scheduled(cron = "0 0 * * * ?")
    public void expireMaterialReservations() {
        log.info("开始执行物料预占过期清理任务");
        try {
            reservationService.expireReservations();
            log.info("物料预占过期清理任务执行完成");
        } catch (Exception e) {
            log.error("物料预占过期清理任务执行失败", e);
        }
    }
}
