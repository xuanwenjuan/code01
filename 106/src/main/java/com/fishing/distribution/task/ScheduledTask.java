package com.fishing.distribution.task;

import com.fishing.distribution.entity.FishingBoat;
import com.fishing.distribution.mapper.FishingBoatMapper;
import com.fishing.distribution.service.SortingOrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class ScheduledTask {

    private final SortingOrderService sortingOrderService;
    private final FishingBoatMapper fishingBoatMapper;

    @Scheduled(fixedRate = 3600000)
    public void checkTimeoutOrders() {
        log.info("开始检查超时分拣工单...");
        try {
            sortingOrderService.processTimeoutOrders();
            log.info("超时工单检查完成");
        } catch (Exception e) {
            log.error("超时工单检查异常", e);
        }
    }

    @Scheduled(cron = "0 0 9 * * ?")
    public void checkExpiringLicenses() {
        log.info("开始检查即将到期的捕捞证件...");
        try {
            LocalDate startDate = LocalDate.now();
            LocalDate endDate = LocalDate.now().plusDays(30);
            List<FishingBoat> expiringBoats = fishingBoatMapper.selectBoatsWithExpiringLicense(startDate, endDate);
            
            for (FishingBoat boat : expiringBoats) {
                log.warn("捕捞证件即将到期预警: 渔船编号={}, 渔船名称={}, 到期日期={}", 
                        boat.getBoatCode(), boat.getBoatName(), boat.getLicenseExpireDate());
            }
            
            log.info("捕捞证件到期检查完成，共发现{}艘即将到期的渔船", expiringBoats.size());
        } catch (Exception e) {
            log.error("捕捞证件到期检查异常", e);
        }
    }

    @Scheduled(cron = "0 0 1 * * ?")
    public void generateDailyReport() {
        log.info("开始生成日报...");
        try {
            log.info("日报生成完成");
        } catch (Exception e) {
            log.error("日报生成异常", e);
        }
    }
}
