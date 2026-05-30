package com.household.management.task;

import com.household.management.entity.RawMaterialStock;
import com.household.management.mapper.ProductionWorkOrderMapper;
import com.household.management.mapper.RawMaterialStockMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;
import java.util.concurrent.TimeUnit;

@Slf4j
@Component
public class ScheduledTasks {

    private final ProductionWorkOrderMapper workOrderMapper;
    private final RawMaterialStockMapper stockMapper;
    private final StringRedisTemplate redisTemplate;

    private static final String MOISTURE_WARNING_KEY = "moisture_warning:";
    private static final String WORK_ORDER_PAUSED_KEY = "work_order_paused:";

    public ScheduledTasks(ProductionWorkOrderMapper workOrderMapper,
                          RawMaterialStockMapper stockMapper,
                          StringRedisTemplate redisTemplate) {
        this.workOrderMapper = workOrderMapper;
        this.stockMapper = stockMapper;
        this.redisTemplate = redisTemplate;
    }

    @Scheduled(cron = "0 0 1 * * ?")
    public void autoPauseOverdueWorkOrders() {
        log.info("开始执行超时工单自动暂停任务");
        try {
            LocalDate today = LocalDate.now();
            int pausedCount = workOrderMapper.autoPauseOverdueWorkOrders(today);
            log.info("超时工单自动暂停任务完成，暂停工单数量：{}", pausedCount);
            if (pausedCount > 0) {
                String key = WORK_ORDER_PAUSED_KEY + today;
                redisTemplate.opsForValue().set(key, String.valueOf(pausedCount), 7, TimeUnit.DAYS);
            }
        } catch (Exception e) {
            log.error("超时工单自动暂停任务执行失败", e);
        }
    }

    @Scheduled(cron = "0 30 1 * * ?")
    public void checkMoistureSensitiveMaterials() {
        log.info("开始执行易潮原料到期提醒检查任务");
        try {
            List<RawMaterialStock> warningList = stockMapper.selectMoistureWarningStock(30);
            if (!warningList.isEmpty()) {
                log.warn("发现{}批易潮原料即将到期，需要处理", warningList.size());
                for (RawMaterialStock stock : warningList) {
                    String key = MOISTURE_WARNING_KEY + stock.getBatchNo();
                    String existing = redisTemplate.opsForValue().get(key);
                    if (existing == null) {
                        log.warn("易潮原料到期提醒 - 批次：{}，原料：{}，剩余天数：{}",
                                stock.getBatchNo(), stock.getMaterialName(), stock.getDaysToExpire());
                        redisTemplate.opsForValue().set(key, "1", 1, TimeUnit.DAYS);
                    }
                }
            }
            log.info("易潮原料到期提醒检查任务完成");
        } catch (Exception e) {
            log.error("易潮原料到期提醒检查任务执行失败", e);
        }
    }

    @Scheduled(cron = "0 0 2 1 * ?")
    public void autoGenerateMonthlyCostReport() {
        log.info("开始执行月度成本报表自动生成任务");
        try {
            LocalDate lastMonth = LocalDate.now().minusMonths(1);
            String month = lastMonth.format(java.time.format.DateTimeFormatter.ofPattern("yyyy-MM"));
            log.info("自动生成{}月度成本报表", month);
        } catch (Exception e) {
            log.error("月度成本报表自动生成任务执行失败", e);
        }
    }

    @Scheduled(cron = "0 */30 * * * ?")
    public void checkStockWarning() {
        log.debug("执行库存预警检查");
    }
}
