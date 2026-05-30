package com.paper.production.task;

import com.paper.production.entity.material.Material;
import com.paper.production.service.cost.ProductionCostService;
import com.paper.production.service.material.MaterialService;
import com.paper.production.service.workorder.WorkOrderService;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@Component
public class ScheduledTask {

    @Resource
    private WorkOrderService workOrderService;

    @Resource
    private MaterialService materialService;

    @Resource
    private ProductionCostService productionCostService;

    @Scheduled(cron = "0 0 1 * * ?")
    public void suspendExpiredOrders() {
        log.info("开始执行超时工单自动搁置任务");
        try {
            workOrderService.checkAndSuspendExpiredOrders();
            log.info("超时工单自动搁置任务执行完成");
        } catch (Exception e) {
            log.error("超时工单自动搁置任务执行失败", e);
        }
    }

    @Scheduled(cron = "0 0 2 * * ?")
    public void checkStockWarning() {
        log.info("开始执行库存预警检查任务");
        try {
            materialService.checkStockWarning();
            log.info("库存预警检查任务执行完成");
        } catch (Exception e) {
            log.error("库存预警检查任务执行失败", e);
        }
    }

    @Scheduled(cron = "0 0 3 1 * ?")
    public void generateMonthlyReport() {
        log.info("开始执行月度报表自动生成任务");
        try {
            productionCostService.autoGenerateMonthlyReport();
            log.info("月度报表自动生成任务执行完成");
        } catch (Exception e) {
            log.error("月度报表自动生成任务执行失败", e);
        }
    }

    @Scheduled(cron = "0 0 9 * * ?")
    public void checkMoistureProofMaterial() {
        log.info("开始执行防潮纸张仓储存放提醒任务");
        try {
            List<Material> materials = materialService.list();
            LocalDate today = LocalDate.now();
            for (Material material : materials) {
                if (Boolean.TRUE.equals(material.getMoistureProof()) && material.getExpiryDate() != null) {
                    long daysUntilExpiry = java.time.temporal.ChronoUnit.DAYS.between(today, material.getExpiryDate());
                    if (daysUntilExpiry <= 7 && daysUntilExpiry >= 0) {
                        log.warn("物料【{}】将于 {} 天后过期，请注意防潮保管", material.getMaterialName(), daysUntilExpiry);
                    }
                }
            }
            log.info("防潮纸张仓储存放提醒任务执行完成");
        } catch (Exception e) {
            log.error("防潮纸张仓储存放提醒任务执行失败", e);
        }
    }
}
