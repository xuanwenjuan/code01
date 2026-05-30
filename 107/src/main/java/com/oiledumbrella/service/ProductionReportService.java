package com.oiledumbrella.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.oiledumbrella.entity.CustomOrder;
import com.oiledumbrella.entity.ProductionReport;
import com.oiledumbrella.enums.OrderStatusEnum;
import com.oiledumbrella.mapper.CustomOrderMapper;
import com.oiledumbrella.mapper.ProductionReportMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductionReportService {

    private final ProductionReportMapper reportMapper;
    private final CustomOrderMapper orderMapper;

    public Page<ProductionReport> page(Integer pageNum, Integer pageSize, Long styleId, LocalDate startDate, LocalDate endDate) {
        Page<ProductionReport> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<ProductionReport> wrapper = new LambdaQueryWrapper<>();
        if (styleId != null) {
            wrapper.eq(ProductionReport::getStyleId, styleId);
        }
        if (startDate != null) {
            wrapper.ge(ProductionReport::getReportDate, startDate);
        }
        if (endDate != null) {
            wrapper.le(ProductionReport::getReportDate, endDate);
        }
        wrapper.orderByDesc(ProductionReport::getReportDate);
        return reportMapper.selectPage(page, wrapper);
    }

    @Transactional
    public void generateDailyReport(LocalDate date) {
        List<CustomOrder> completedOrders = orderMapper.selectList(
                new LambdaQueryWrapper<CustomOrder>()
                        .eq(CustomOrder::getOrderStatus, OrderStatusEnum.COMPLETED.getCode())
                        .ge(CustomOrder::getActualFinishDate, date)
                        .lt(CustomOrder::getActualFinishDate, date.plusDays(1))
        );

        Map<Long, List<CustomOrder>> ordersByStyle = completedOrders.stream()
                .collect(Collectors.groupingBy(CustomOrder::getStyleId));

        for (Map.Entry<Long, List<CustomOrder>> entry : ordersByStyle.entrySet()) {
            Long styleId = entry.getKey();
            List<CustomOrder> orders = entry.getValue();

            int orderCount = orders.size();
            int totalQuantity = orders.stream().mapToInt(CustomOrder::getQuantity).sum();
            BigDecimal totalSales = orders.stream()
                    .map(CustomOrder::getTotalPrice)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            BigDecimal materialCost = calculateMaterialCost(orders);
            BigDecimal laborCost = calculateLaborCost(orders);
            BigDecimal totalCost = materialCost.add(laborCost);
            BigDecimal profit = totalSales.subtract(totalCost);
            BigDecimal profitMargin = totalSales.compareTo(BigDecimal.ZERO) > 0
                    ? profit.divide(totalSales, 4, BigDecimal.ROUND_HALF_UP).multiply(new BigDecimal("100"))
                    : BigDecimal.ZERO;

            ProductionReport exist = reportMapper.selectOne(
                    new LambdaQueryWrapper<ProductionReport>()
                            .eq(ProductionReport::getReportDate, date)
                            .eq(ProductionReport::getStyleId, styleId)
            );

            if (exist != null) {
                exist.setOrderCount(orderCount);
                exist.setTotalQuantity(totalQuantity);
                exist.setTotalSales(totalSales);
                exist.setMaterialCost(materialCost);
                exist.setLaborCost(laborCost);
                exist.setTotalCost(totalCost);
                exist.setProfit(profit);
                exist.setProfitMargin(profitMargin);
                reportMapper.updateById(exist);
            } else {
                ProductionReport report = new ProductionReport();
                report.setReportDate(date);
                report.setStyleId(styleId);
                report.setOrderCount(orderCount);
                report.setTotalQuantity(totalQuantity);
                report.setTotalSales(totalSales);
                report.setMaterialCost(materialCost);
                report.setLaborCost(laborCost);
                report.setTotalCost(totalCost);
                report.setProfit(profit);
                report.setProfitMargin(profitMargin);
                reportMapper.insert(report);
            }
        }
    }

    public Map<String, Object> getMonthlySummary(int year, int month) {
        YearMonth yearMonth = YearMonth.of(year, month);
        LocalDate startDate = yearMonth.atDay(1);
        LocalDate endDate = yearMonth.atEndOfMonth();

        List<ProductionReport> reports = reportMapper.selectList(
                new LambdaQueryWrapper<ProductionReport>()
                        .ge(ProductionReport::getReportDate, startDate)
                        .le(ProductionReport::getReportDate, endDate)
        );

        int totalOrders = reports.stream().mapToInt(ProductionReport::getOrderCount).sum();
        int totalQuantity = reports.stream().mapToInt(ProductionReport::getTotalQuantity).sum();
        BigDecimal totalSales = reports.stream()
                .map(ProductionReport::getTotalSales)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalCost = reports.stream()
                .map(ProductionReport::getTotalCost)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalProfit = reports.stream()
                .map(ProductionReport::getProfit)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal avgProfitMargin = totalSales.compareTo(BigDecimal.ZERO) > 0
                ? totalProfit.divide(totalSales, 4, BigDecimal.ROUND_HALF_UP).multiply(new BigDecimal("100"))
                : BigDecimal.ZERO;

        Map<String, Object> summary = new java.util.HashMap<>();
        summary.put("year", year);
        summary.put("month", month);
        summary.put("totalOrders", totalOrders);
        summary.put("totalQuantity", totalQuantity);
        summary.put("totalSales", totalSales);
        summary.put("totalCost", totalCost);
        summary.put("totalProfit", totalProfit);
        summary.put("avgProfitMargin", avgProfitMargin);

        return summary;
    }

    public List<ProductionReport> getStyleRanking(int year, int month, int limit) {
        YearMonth yearMonth = YearMonth.of(year, month);
        LocalDate startDate = yearMonth.atDay(1);
        LocalDate endDate = yearMonth.atEndOfMonth();

        List<ProductionReport> reports = reportMapper.selectList(
                new LambdaQueryWrapper<ProductionReport>()
                        .ge(ProductionReport::getReportDate, startDate)
                        .le(ProductionReport::getReportDate, endDate)
        );

        Map<Long, List<ProductionReport>> reportsByStyle = reports.stream()
                .collect(Collectors.groupingBy(ProductionReport::getStyleId));

        return reportsByStyle.entrySet().stream()
                .map(entry -> {
                    ProductionReport summary = new ProductionReport();
                    summary.setStyleId(entry.getKey());
                    summary.setOrderCount(entry.getValue().stream().mapToInt(ProductionReport::getOrderCount).sum());
                    summary.setTotalQuantity(entry.getValue().stream().mapToInt(ProductionReport::getTotalQuantity).sum());
                    summary.setTotalSales(entry.getValue().stream()
                            .map(ProductionReport::getTotalSales)
                            .reduce(BigDecimal.ZERO, BigDecimal::add));
                    summary.setProfit(entry.getValue().stream()
                            .map(ProductionReport::getProfit)
                            .reduce(BigDecimal.ZERO, BigDecimal::add));
                    return summary;
                })
                .sorted((a, b) -> b.getTotalSales().compareTo(a.getTotalSales()))
                .limit(limit)
                .collect(Collectors.toList());
    }

    private BigDecimal calculateMaterialCost(List<CustomOrder> orders) {
        BigDecimal totalCost = BigDecimal.ZERO;
        for (CustomOrder order : orders) {
            BigDecimal unitCost = order.getUnitPrice().multiply(new BigDecimal("0.4"));
            totalCost = totalCost.add(unitCost.multiply(new BigDecimal(order.getQuantity())));
        }
        return totalCost;
    }

    private BigDecimal calculateLaborCost(List<CustomOrder> orders) {
        BigDecimal totalCost = BigDecimal.ZERO;
        for (CustomOrder order : orders) {
            BigDecimal unitCost = order.getUnitPrice().multiply(new BigDecimal("0.3"));
            totalCost = totalCost.add(unitCost.multiply(new BigDecimal(order.getQuantity())));
        }
        return totalCost;
    }
}
