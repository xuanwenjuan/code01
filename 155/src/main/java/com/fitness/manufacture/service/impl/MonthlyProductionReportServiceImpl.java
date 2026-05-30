package com.fitness.manufacture.service.impl;

import cn.hutool.core.date.DateUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.fitness.manufacture.common.BusinessException;
import com.fitness.manufacture.common.PageQuery;
import com.fitness.manufacture.common.ResultCode;
import com.fitness.manufacture.entity.CostStatistics;
import com.fitness.manufacture.entity.MonthlyProductionReport;
import com.fitness.manufacture.entity.Product;
import com.fitness.manufacture.entity.WorkOrder;
import com.fitness.manufacture.mapper.CostStatisticsMapper;
import com.fitness.manufacture.mapper.MonthlyProductionReportMapper;
import com.fitness.manufacture.mapper.ProductMapper;
import com.fitness.manufacture.mapper.WorkOrderMapper;
import com.fitness.manufacture.service.MonthlyProductionReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MonthlyProductionReportServiceImpl extends ServiceImpl<MonthlyProductionReportMapper, MonthlyProductionReport> implements MonthlyProductionReportService {

    private final MonthlyProductionReportMapper monthlyProductionReportMapper;
    private final WorkOrderMapper workOrderMapper;
    private final CostStatisticsMapper costStatisticsMapper;
    private final ProductMapper productMapper;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void generateMonthlyReport(String reportMonth) {
        YearMonth yearMonth = YearMonth.parse(reportMonth);
        LocalDate startDate = yearMonth.atDay(1);
        LocalDate endDate = yearMonth.atEndOfMonth();

        LambdaQueryWrapper<MonthlyProductionReport> existWrapper = new LambdaQueryWrapper<>();
        existWrapper.eq(MonthlyProductionReport::getReportMonth, reportMonth);
        MonthlyProductionReport exist = monthlyProductionReportMapper.selectOne(existWrapper);
        if (exist != null) {
            throw new BusinessException(ResultCode.DATA_EXIST, "该月份报表已生成");
        }

        LambdaQueryWrapper<WorkOrder> orderWrapper = new LambdaQueryWrapper<>();
        orderWrapper.ge(WorkOrder::getCreateTime, startDate.atStartOfDay());
        orderWrapper.le(WorkOrder::getCreateTime, endDate.atTime(23, 59, 59));
        List<WorkOrder> orders = workOrderMapper.selectList(orderWrapper);

        int totalOrders = orders.size();
        int completedOrders = (int) orders.stream().filter(o -> o.getStatus() == 5).count();
        int totalQuantity = orders.stream()
                .filter(o -> o.getActualQuantity() != null)
                .mapToInt(WorkOrder::getActualQuantity)
                .sum();

        LambdaQueryWrapper<CostStatistics> costWrapper = new LambdaQueryWrapper<>();
        costWrapper.ge(CostStatistics::getStatisticsDate, startDate);
        costWrapper.le(CostStatistics::getStatisticsDate, endDate);
        List<CostStatistics> costs = costStatisticsMapper.selectList(costWrapper);

        BigDecimal totalMaterialCost = costs.stream()
                .filter(c -> c.getMaterialCost() != null)
                .map(CostStatistics::getMaterialCost)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalWeldingCost = costs.stream()
                .filter(c -> c.getWeldingCost() != null)
                .map(CostStatistics::getWeldingCost)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalLaborCost = costs.stream()
                .filter(c -> c.getLaborCost() != null)
                .map(CostStatistics::getLaborCost)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalEquipmentCost = costs.stream()
                .filter(c -> c.getEquipmentCost() != null)
                .map(CostStatistics::getEquipmentCost)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalScrapCost = costs.stream()
                .filter(c -> c.getScrapCost() != null)
                .map(CostStatistics::getScrapCost)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalCost = totalMaterialCost.add(totalWeldingCost)
                .add(totalLaborCost).add(totalEquipmentCost).add(totalScrapCost);

        BigDecimal totalSales = BigDecimal.ZERO;
        for (WorkOrder order : orders) {
            if (order.getStatus() == 5 && order.getActualQuantity() != null && order.getActualQuantity() > 0) {
                Product product = productMapper.selectById(order.getProductId());
                if (product != null && product.getSalePrice() != null) {
                    totalSales = totalSales.add(product.getSalePrice().multiply(new BigDecimal(order.getActualQuantity())));
                }
            }
        }

        BigDecimal grossProfit = totalSales.subtract(totalCost);
        BigDecimal grossMargin = totalSales.compareTo(BigDecimal.ZERO) > 0
                ? grossProfit.divide(totalSales, 4, RoundingMode.HALF_UP).multiply(new BigDecimal("100"))
                : BigDecimal.ZERO;

        MonthlyProductionReport report = new MonthlyProductionReport();
        report.setReportMonth(reportMonth);
        report.setTotalOrders(totalOrders);
        report.setCompletedOrders(completedOrders);
        report.setTotalQuantity(totalQuantity);
        report.setTotalMaterialCost(totalMaterialCost);
        report.setTotalWeldingCost(totalWeldingCost);
        report.setTotalLaborCost(totalLaborCost);
        report.setTotalEquipmentCost(totalEquipmentCost);
        report.setTotalScrapCost(totalScrapCost);
        report.setTotalCost(totalCost);
        report.setTotalSales(totalSales);
        report.setGrossProfit(grossProfit);
        report.setGrossMargin(grossMargin);
        report.setStatus(0);
        report.setGenerateTime(LocalDateTime.now());
        monthlyProductionReportMapper.insert(report);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void confirmMonthlyReport(Long id) {
        MonthlyProductionReport report = monthlyProductionReportMapper.selectById(id);
        if (report == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }
        if (report.getStatus() == 1) {
            throw new BusinessException(ResultCode.BUSINESS_ERROR, "报表已确认");
        }
        report.setStatus(1);
        report.setConfirmTime(LocalDateTime.now());
        monthlyProductionReportMapper.updateById(report);
    }

    @Override
    public IPage<MonthlyProductionReport> getReportPage(PageQuery query, String reportMonth, Integer status) {
        LambdaQueryWrapper<MonthlyProductionReport> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(reportMonth)) {
            wrapper.eq(MonthlyProductionReport::getReportMonth, reportMonth);
        }
        if (status != null) {
            wrapper.eq(MonthlyProductionReport::getStatus, status);
        }
        wrapper.orderByDesc(MonthlyProductionReport::getReportMonth);

        Page<MonthlyProductionReport> page = new Page<>(query.getPageNum(), query.getPageSize());
        return monthlyProductionReportMapper.selectPage(page, wrapper);
    }

    @Override
    public void generateLastMonthReport() {
        YearMonth lastMonth = YearMonth.now().minusMonths(1);
        String reportMonth = lastMonth.toString();
        try {
            generateMonthlyReport(reportMonth);
        } catch (BusinessException e) {
            if (!ResultCode.DATA_EXIST.getCode().equals(e.getCode())) {
                throw e;
            }
        }
    }
}
