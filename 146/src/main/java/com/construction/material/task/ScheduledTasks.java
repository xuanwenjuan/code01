package com.construction.material.task;

import com.construction.material.entity.MaterialInventory;
import com.construction.material.entity.MaterialWorkOrder;
import com.construction.material.mapper.MaterialInventoryMapper;
import com.construction.material.mapper.MaterialWorkOrderMapper;
import com.construction.material.service.MaterialInventoryService;
import com.construction.material.service.MaterialWorkOrderService;
import com.construction.material.utils.RedisUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.TimeUnit;

@Slf4j
@Component
@RequiredArgsConstructor
public class ScheduledTasks {

    private final MaterialInventoryService inventoryService;
    private final MaterialWorkOrderService workOrderService;
    private final MaterialInventoryMapper inventoryMapper;
    private final MaterialWorkOrderMapper workOrderMapper;
    private final RedisUtils redisUtils;

    @Scheduled(cron = "0 0 2 * * ?")
    public void updateInventoryStatusTask() {
        log.info("开始执行库存状态更新定时任务: {}", LocalDateTime.now());
        try {
            inventoryService.updateInventoryStatus();
            log.info("库存状态更新定时任务执行完成");
        } catch (Exception e) {
            log.error("库存状态更新定时任务执行失败", e);
        }
    }

    @Scheduled(cron = "0 0 3 * * ?")
    public void processOverdueOrdersTask() {
        log.info("开始执行超期工单处理定时任务: {}", LocalDateTime.now());
        try {
            workOrderService.processOverdueOrders();
            log.info("超期工单处理定时任务执行完成");
        } catch (Exception e) {
            log.error("超期工单处理定时任务执行失败", e);
        }
    }

    @Scheduled(cron = "0 30 8 * * ?")
    public void checkInventoryWarningTask() {
        log.info("开始执行库存预警检查定时任务: {}", LocalDateTime.now());
        try {
            List<MaterialInventory> warningList = inventoryMapper.selectWarningInventory();
            if (!warningList.isEmpty()) {
                String key = "inventory:warning:" + LocalDateTime.now().toLocalDate();
                redisUtils.set(key, warningList, 24, TimeUnit.HOURS);
                log.info("检测到 {} 条库存预警记录，已缓存到Redis", warningList.size());
            }

            List<MaterialInventory> moistureList = inventoryMapper.selectMoistureProofWarning();
            if (!moistureList.isEmpty()) {
                String key = "inventory:moisture_warning:" + LocalDateTime.now().toLocalDate();
                redisUtils.set(key, moistureList, 24, TimeUnit.HOURS);
                log.info("检测到 {} 条防潮预警记录，已缓存到Redis", moistureList.size());
            }
        } catch (Exception e) {
            log.error("库存预警检查定时任务执行失败", e);
        }
    }

    @Scheduled(cron = "0 0 9 * * ?")
    public void checkPendingVerifyOrdersTask() {
        log.info("开始执行待核销工单提醒定时任务: {}", LocalDateTime.now());
        try {
            List<MaterialWorkOrder> pendingOrders = workOrderMapper.selectPendingVerifyOrders();
            if (!pendingOrders.isEmpty()) {
                String key = "workorder:pending_verify:" + LocalDateTime.now().toLocalDate();
                redisUtils.set(key, pendingOrders, 24, TimeUnit.HOURS);
                log.info("检测到 {} 条待核销工单，已缓存到Redis", pendingOrders.size());
            }
        } catch (Exception e) {
            log.error("待核销工单提醒定时任务执行失败", e);
        }
    }

    @Scheduled(cron = "0 0 0 1 * ?")
    public void generateMonthlyCostStatisticsTask() {
        log.info("开始执行月度成本统计定时任务: {}", LocalDateTime.now());
        try {
            log.info("月度成本统计定时任务执行完成");
        } catch (Exception e) {
            log.error("月度成本统计定时任务执行失败", e);
        }
    }
}
