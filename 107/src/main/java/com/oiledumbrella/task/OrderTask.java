package com.oiledumbrella.task;

import com.oiledumbrella.entity.CustomOrder;
import com.oiledumbrella.enums.OrderStatusEnum;
import com.oiledumbrella.service.CustomOrderService;
import com.oiledumbrella.service.ProductionReportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class OrderTask {

    private final CustomOrderService orderService;
    private final ProductionReportService reportService;

    @Scheduled(cron = "0 0 * * * ?")
    public void cancelExpiredPendingOrders() {
        log.info("开始执行超时未支付定金工单自动取消任务");
        List<CustomOrder> expiredOrders = orderService.getExpiredPendingOrders();
        for (CustomOrder order : expiredOrders) {
            try {
                orderService.cancelOrder(order.getId(), null, "系统自动取消-超时未支付定金");
                log.info("自动取消超时工单: {}", order.getOrderNo());
            } catch (Exception e) {
                log.error("取消工单失败: {}", order.getOrderNo(), e);
            }
        }
        log.info("超时未支付定金工单自动取消任务执行完成，共取消{}个工单", expiredOrders.size());
    }

    @Scheduled(cron = "0 30 2 * * ?")
    public void generateDailyReport() {
        log.info("开始执行每日生产报表生成任务");
        try {
            LocalDate yesterday = LocalDate.now().minusDays(1);
            reportService.generateDailyReport(yesterday);
            log.info("每日生产报表生成任务执行完成，日期: {}", yesterday);
        } catch (Exception e) {
            log.error("每日生产报表生成失败", e);
        }
    }
}
