package com.spindle.manage.task;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.spindle.manage.entity.MaterialInventory;
import com.spindle.manage.service.MaterialInventoryService;
import com.spindle.manage.service.ProductionOrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class ScheduledTasks {

    private final ProductionOrderService productionOrderService;
    private final MaterialInventoryService materialInventoryService;

    @Scheduled(cron = "0 0 2 * * ?")
    public void checkOverdueOrders() {
        log.info("开始检查超期未投产工单");
        productionOrderService.checkAndPauseOverdueOrders();
        log.info("超期未投产工单检查完成");
    }

    @Scheduled(cron = "0 0 3 * * ?")
    public void checkConstantTempExpire() {
        log.info("开始检查恒温仓储时效到期物料");
        LambdaQueryWrapper<MaterialInventory> wrapper = new LambdaQueryWrapper<>();
        wrapper.isNotNull(MaterialInventory::getConstantTempExpireTime)
                .lt(MaterialInventory::getConstantTempExpireTime, LocalDateTime.now().plusDays(3))
                .eq(MaterialInventory::getInventoryStatus, 1);
        List<MaterialInventory> expiringMaterials = materialInventoryService.list(wrapper);

        for (MaterialInventory material : expiringMaterials) {
            log.warn("物料 {} 批次 {} 恒温仓储时效即将到期，请及时处理",
                    material.getMaterialName(), material.getBatchNo());
        }
        log.info("恒温仓储时效检查完成，共发现 {} 个即将到期物料", expiringMaterials.size());
    }

}
