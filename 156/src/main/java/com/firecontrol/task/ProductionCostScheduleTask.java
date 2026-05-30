package com.firecontrol.task;

import com.firecontrol.service.ProductionCostService;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class ProductionCostScheduleTask {

    @Resource
    private ProductionCostService productionCostService;

    @Scheduled(cron = "0 30 2 * * ?")
    public void autoCalculateCosts() {
        log.info("开始执行生产成本自动核算定时任务");
        try {
            productionCostService.autoCalculateCosts();
            log.info("生产成本自动核算定时任务执行完成");
        } catch (Exception e) {
            log.error("生产成本自动核算定时任务执行失败", e);
        }
    }

    @Scheduled(cron = "0 0 3 1 * ?")
    public void generateMonthlyReport() {
        log.info("开始执行月度生产报表生成定时任务");
        try {
            productionCostService.generateMonthlyReport();
            log.info("月度生产报表生成定时任务执行完成");
        } catch (Exception e) {
            log.error("月度生产报表生成定时任务执行失败", e);
        }
    }
}
