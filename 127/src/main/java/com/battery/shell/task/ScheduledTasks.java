package com.battery.shell.task;

import com.battery.shell.entity.Material;
import com.battery.shell.service.MaterialService;
import com.battery.shell.service.ProductionOrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class ScheduledTasks {

    private final ProductionOrderService productionOrderService;
    private final MaterialService materialService;

    @Scheduled(cron = "0 0 2 * * ?")
    public void autoPauseOverdueOrders() {
        log.info("开始执行超时工单自动暂停任务");
        try {
            productionOrderService.autoPauseOverdueOrders();
            log.info("超时工单自动暂停任务执行完成");
        } catch (Exception e) {
            log.error("超时工单自动暂停任务执行失败", e);
        }
    }

    @Scheduled(cron = "0 0 3 * * ?")
    public void checkMaterialExpiration() {
        log.info("开始执行易氧化物料仓储时效检查任务");
        try {
            List<Material> expiringMaterials = materialService.getExpiringMaterials();
            if (!expiringMaterials.isEmpty()) {
                log.warn("发现{}批即将过期的易氧化物料，请及时处理", expiringMaterials.size());
                for (Material material : expiringMaterials) {
                    log.warn("物料编码：{}，物料名称：{}，入库时间：{}",
                            material.getMaterialCode(),
                            material.getMaterialName(),
                            material.getInboundTime());
                }
            } else {
                log.info("未发现即将过期的易氧化物料");
            }
        } catch (Exception e) {
            log.error("易氧化物料仓储时效检查任务执行失败", e);
        }
    }
}
