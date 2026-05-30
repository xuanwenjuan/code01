package com.logistics.bigcargo.task;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.logistics.bigcargo.entity.Inventory;
import com.logistics.bigcargo.entity.MonthlyReport;
import com.logistics.bigcargo.mapper.InventoryMapper;
import com.logistics.bigcargo.mapper.MonthlyReportMapper;
import com.logistics.bigcargo.service.DispatchOrderService;
import com.logistics.bigcargo.service.LogisticsCostService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.concurrent.TimeUnit;

@Slf4j
@Component
public class ScheduledTask {

    @Autowired
    private InventoryMapper inventoryMapper;

    @Autowired
    private DispatchOrderService dispatchOrderService;

    @Autowired
    private LogisticsCostService logisticsCostService;

    @Autowired
    private StringRedisTemplate stringRedisTemplate;

    @Autowired
    private MonthlyReportMapper monthlyReportMapper;

    @Scheduled(cron = "0 0 9 * * ?")
    public void checkProtectionExpire() {
        log.info("开始执行易损货品防护到期提醒检查任务");
        try {
            LocalDateTime now = LocalDateTime.now();
            LocalDateTime threeDaysLater = now.plusDays(3);

            List<Inventory> expiringInventories = inventoryMapper.selectList(
                    new LambdaQueryWrapper<Inventory>()
                            .eq(Inventory::getFragileFlag, 1)
                            .ge(Inventory::getProtectionExpireTime, now)
                            .le(Inventory::getProtectionExpireTime, threeDaysLater)
                            .eq(Inventory::getStockStatus, 1));

            for (Inventory inventory : expiringInventories) {
                String key = "expire:remind:" + inventory.getId();
                Boolean hasReminded = stringRedisTemplate.hasKey(key);
                if (Boolean.FALSE.equals(hasReminded)) {
                    log.warn("易损货品防护即将到期：批次号={}, 货品名称={}, 到期时间={}",
                            inventory.getBatchNo(), inventory.getGoodsName(), inventory.getProtectionExpireTime());
                    stringRedisTemplate.opsForValue().set(key, "1", 3, TimeUnit.DAYS);
                }
            }
            log.info("易损货品防护到期提醒检查任务完成，共发现{}条即将到期记录", expiringInventories.size());
        } catch (Exception e) {
            log.error("易损货品防护到期提醒检查任务异常", e);
        }
    }

    @Scheduled(cron = "0 */30 * * * ?")
    public void handleTimeoutOrders() {
        log.info("开始执行超时工单自动搁置任务");
        try {
            dispatchOrderService.timeoutHandle();
            log.info("超时工单自动搁置任务完成");
        } catch (Exception e) {
            log.error("超时工单自动搁置任务异常", e);
        }
    }

    @Scheduled(cron = "0 0 2 1 * ?")
    public void generateLastMonthReport() {
        log.info("开始执行上月月度报表自动生成任务");
        try {
            LocalDate lastMonth = LocalDate.now().minusMonths(1);
            String reportMonth = lastMonth.format(DateTimeFormatter.ofPattern("yyyy-MM"));

            Long count = monthlyReportMapper.selectCount(
                    new LambdaQueryWrapper<MonthlyReport>()
                            .eq(MonthlyReport::getReportMonth, reportMonth)
                            .eq(MonthlyReport::getStatus, 2));

            if (count == 0) {
                logisticsCostService.generateMonthlyReport(reportMonth, 0L, "系统");
                log.info("上月月度报表自动生成完成，报表月份：{}", reportMonth);
            } else {
                log.info("上月月度报表已存在，跳过生成");
            }
        } catch (Exception e) {
            log.error("上月月度报表自动生成任务异常", e);
        }
    }
}
