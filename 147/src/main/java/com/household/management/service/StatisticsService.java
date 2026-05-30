package com.household.management.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.household.management.entity.*;
import com.household.management.mapper.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
public class StatisticsService {

    private final ProductionWorkOrderMapper workOrderMapper;
    private final SalesOrderMapper salesOrderMapper;
    private final RawMaterialInboundMapper rawMaterialInboundMapper;
    private final FinishedProductInboundMapper finishedProductInboundMapper;
    private final SalesOutboundMapper salesOutboundMapper;
    private final QualityInspectionMapper qualityInspectionMapper;
    private final RawMaterialStockMapper rawMaterialStockMapper;
    private final FinishedProductStockMapper finishedProductStockMapper;

    public StatisticsService(ProductionWorkOrderMapper workOrderMapper,
                             SalesOrderMapper salesOrderMapper,
                             RawMaterialInboundMapper rawMaterialInboundMapper,
                             FinishedProductInboundMapper finishedProductInboundMapper,
                             SalesOutboundMapper salesOutboundMapper,
                             QualityInspectionMapper qualityInspectionMapper,
                             RawMaterialStockMapper rawMaterialStockMapper,
                             FinishedProductStockMapper finishedProductStockMapper) {
        this.workOrderMapper = workOrderMapper;
        this.salesOrderMapper = salesOrderMapper;
        this.rawMaterialInboundMapper = rawMaterialInboundMapper;
        this.finishedProductInboundMapper = finishedProductInboundMapper;
        this.salesOutboundMapper = salesOutboundMapper;
        this.qualityInspectionMapper = qualityInspectionMapper;
        this.rawMaterialStockMapper = rawMaterialStockMapper;
        this.finishedProductStockMapper = finishedProductStockMapper;
    }

    public Map<String, Object> getDashboardStatistics() {
        Map<String, Object> result = new HashMap<>();

        LocalDate today = LocalDate.now();
        String month = today.format(DateTimeFormatter.ofPattern("yyyy-MM"));
        String startOfMonth = month + "-01 00:00:00";
        String endOfMonth = month + "-31 23:59:59";

        long pendingWorkOrders = workOrderMapper.selectCount(
                new LambdaQueryWrapper<ProductionWorkOrder>()
                        .eq(ProductionWorkOrder::getStatus, 1));
        long inProgressWorkOrders = workOrderMapper.selectCount(
                new LambdaQueryWrapper<ProductionWorkOrder>()
                        .eq(ProductionWorkOrder::getStatus, 2));
        long completedWorkOrders = workOrderMapper.selectCount(
                new LambdaQueryWrapper<ProductionWorkOrder>()
                        .eq(ProductionWorkOrder::getStatus, 4));

        long pendingSalesOrders = salesOrderMapper.selectCount(
                new LambdaQueryWrapper<SalesOrder>()
                        .eq(SalesOrder::getStatus, 1));
        long shippingOrders = salesOrderMapper.selectCount(
                new LambdaQueryWrapper<SalesOrder>()
                        .eq(SalesOrder::getStatus, 3));
        long completedSalesOrders = salesOrderMapper.selectCount(
                new LambdaQueryWrapper<SalesOrder>()
                        .eq(SalesOrder::getStatus, 5));

        long pendingInbound = rawMaterialInboundMapper.selectCount(
                new LambdaQueryWrapper<RawMaterialInbound>()
                        .eq(RawMaterialInbound::getStatus, 1));
        long pendingOutbound = salesOutboundMapper.selectCount(
                new LambdaQueryWrapper<SalesOutbound>()
                        .eq(SalesOutbound::getStatus, 1));
        long pendingInspection = qualityInspectionMapper.selectCount(
                new LambdaQueryWrapper<QualityInspection>()
                        .eq(QualityInspection::getStatus, 1));

        List<RawMaterialStock> warningMaterials = rawMaterialStockMapper.selectMoistureWarningStock(30);
        List<FinishedProductStock> finishedStockList = finishedProductStockMapper.selectStockListWithProduct();
        long lowStockProducts = finishedStockList.stream()
                .filter(s -> s.getStatus() != null && s.getStatus() == 2)
                .count();

        result.put("pendingWorkOrders", pendingWorkOrders);
        result.put("inProgressWorkOrders", inProgressWorkOrders);
        result.put("completedWorkOrders", completedWorkOrders);
        result.put("pendingSalesOrders", pendingSalesOrders);
        result.put("shippingOrders", shippingOrders);
        result.put("completedSalesOrders", completedSalesOrders);
        result.put("pendingInbound", pendingInbound);
        result.put("pendingOutbound", pendingOutbound);
        result.put("pendingInspection", pendingInspection);
        result.put("warningMaterials", warningMaterials.size());
        result.put("lowStockProducts", lowStockProducts);

        return result;
    }

    public Map<String, Object> getMonthlyStatistics(String month) {
        Map<String, Object> result = new HashMap<>();

        if (month == null || month.isEmpty()) {
            month = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM"));
        }

        long workOrderCount = workOrderMapper.selectCount(
                new LambdaQueryWrapper<ProductionWorkOrder>()
                        .apply("DATE_FORMAT(create_time, '%Y-%m') = {0}", month));
        long salesOrderCount = salesOrderMapper.selectCount(
                new LambdaQueryWrapper<SalesOrder>()
                        .apply("DATE_FORMAT(create_time, '%Y-%m') = {0}", month));
        long rawInboundCount = rawMaterialInboundMapper.selectCount(
                new LambdaQueryWrapper<RawMaterialInbound>()
                        .eq(RawMaterialInbound::getStatus, 2)
                        .apply("DATE_FORMAT(create_time, '%Y-%m') = {0}", month));
        long finishedInboundCount = finishedProductInboundMapper.selectCount(
                new LambdaQueryWrapper<FinishedProductInbound>()
                        .eq(FinishedProductInbound::getStatus, 2)
                        .apply("DATE_FORMAT(create_time, '%Y-%m') = {0}", month));
        long outboundCount = salesOutboundMapper.selectCount(
                new LambdaQueryWrapper<SalesOutbound>()
                        .eq(SalesOutbound::getStatus, 2)
                        .apply("DATE_FORMAT(create_time, '%Y-%m') = {0}", month));

        List<SalesOutbound> outboundList = salesOutboundMapper.selectOutboundList();
        BigDecimal totalSales = outboundList.stream()
                .filter(o -> o.getStatus() != null && o.getStatus() == 2)
                .filter(o -> o.getCreateTime() != null &&
                        o.getCreateTime().format(DateTimeFormatter.ofPattern("yyyy-MM")).equals(month))
                .map(SalesOutbound::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        result.put("month", month);
        result.put("workOrderCount", workOrderCount);
        result.put("salesOrderCount", salesOrderCount);
        result.put("rawInboundCount", rawInboundCount);
        result.put("finishedInboundCount", finishedInboundCount);
        result.put("outboundCount", outboundCount);
        result.put("totalSales", totalSales);

        return result;
    }
}
