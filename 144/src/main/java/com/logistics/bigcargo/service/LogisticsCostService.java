package com.logistics.bigcargo.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.logistics.bigcargo.dto.AutoCalculateDTO;
import com.logistics.bigcargo.dto.LogisticsCostDTO;
import com.logistics.bigcargo.dto.ReconciliationDTO;
import com.logistics.bigcargo.entity.*;
import com.logistics.bigcargo.enums.OrderStatusEnum;
import com.logistics.bigcargo.exception.BusinessException;
import com.logistics.bigcargo.mapper.*;
import com.logistics.bigcargo.util.OperationLogUtil;
import com.logistics.bigcargo.vo.CostStatisticsVO;
import com.logistics.bigcargo.vo.ReconciliationResultVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class LogisticsCostService {

    @Autowired
    private LogisticsCostMapper logisticsCostMapper;

    @Autowired
    private DispatchOrderMapper dispatchOrderMapper;

    @Autowired
    private CategoryMapper categoryMapper;

    @Autowired
    private MonthlyReportMapper monthlyReportMapper;

    @Autowired
    private InventoryMapper inventoryMapper;

    @Autowired
    private OperationLogUtil operationLogUtil;

    @Transactional(rollbackFor = Exception.class)
    public LogisticsCost autoCalculateCost(AutoCalculateDTO dto, Long operatorId, String operatorName) {
        DispatchOrder order = dispatchOrderMapper.selectById(dto.getOrderId());
        if (order == null) {
            throw new BusinessException("工单不存在");
        }

        BigDecimal storageFee = BigDecimal.ZERO;
        BigDecimal sortingFee = BigDecimal.ZERO;
        BigDecimal transportFee = BigDecimal.ZERO;
        BigDecimal loadingFee = BigDecimal.ZERO;

        if (dto.getStorageDays() != null && dto.getStorageUnitPrice() != null) {
            storageFee = BigDecimal.valueOf(dto.getStorageDays())
                    .multiply(dto.getStorageUnitPrice());
        } else {
            int days = 1;
            if (order.getCreateTime() != null) {
                days = (int) java.time.Duration.between(order.getCreateTime(), LocalDateTime.now()).toDays() + 1;
            }
            BigDecimal unitPrice = new BigDecimal("50");
            storageFee = BigDecimal.valueOf(days).multiply(unitPrice);
        }

        if (dto.getSortingUnitPrice() != null) {
            sortingFee = dto.getSortingUnitPrice();
        } else {
            sortingFee = new BigDecimal("100");
        }

        if (dto.getTransportUnitPrice() != null && order.getDistance() != null) {
            transportFee = order.getDistance().multiply(dto.getTransportUnitPrice());
        } else if (order.getDistance() != null) {
            transportFee = order.getDistance().multiply(new BigDecimal("8"));
        } else {
            transportFee = new BigDecimal("200");
        }

        if (dto.getLoadingUnitPrice() != null) {
            loadingFee = dto.getLoadingUnitPrice();
        } else {
            loadingFee = new BigDecimal("80");
        }

        LogisticsCost cost = new LogisticsCost();
        cost.setOrderId(dto.getOrderId());
        cost.setOrderNo(order.getOrderNo());
        cost.setCategoryId(order.getCategoryId());
        cost.setStorageFee(storageFee);
        cost.setSortingFee(sortingFee);
        cost.setTransportFee(transportFee);
        cost.setLoadingFee(loadingFee);
        cost.setDamageFee(BigDecimal.ZERO);
        cost.setTotalCost(storageFee.add(sortingFee).add(transportFee).add(loadingFee));
        cost.setCostMonth(LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM")));
        cost.setRemark("系统自动计算");

        logisticsCostMapper.insert(cost);

        operationLogUtil.log("自动计费", order.getOrderNo(), "LOGISTICS_COST",
                operatorId, operatorName, "系统自动计算物流费用，总费用：" + cost.getTotalCost());

        return cost;
    }

    @Transactional(rollbackFor = Exception.class)
    public void addCost(LogisticsCostDTO dto, Long operatorId, String operatorName) {
        DispatchOrder order = dispatchOrderMapper.selectById(dto.getOrderId());
        if (order == null) {
            throw new BusinessException("工单不存在");
        }

        LogisticsCost cost = new LogisticsCost();
        cost.setOrderId(dto.getOrderId());
        cost.setOrderNo(order.getOrderNo());
        cost.setCategoryId(dto.getCategoryId() != null ? dto.getCategoryId() : order.getCategoryId());
        cost.setStorageFee(dto.getStorageFee() != null ? dto.getStorageFee() : BigDecimal.ZERO);
        cost.setSortingFee(dto.getSortingFee() != null ? dto.getSortingFee() : BigDecimal.ZERO);
        cost.setTransportFee(dto.getTransportFee() != null ? dto.getTransportFee() : BigDecimal.ZERO);
        cost.setLoadingFee(dto.getLoadingFee() != null ? dto.getLoadingFee() : BigDecimal.ZERO);
        cost.setDamageFee(dto.getDamageFee() != null ? dto.getDamageFee() : BigDecimal.ZERO);
        cost.setTotalCost(cost.getStorageFee()
                .add(cost.getSortingFee())
                .add(cost.getTransportFee())
                .add(cost.getLoadingFee())
                .add(cost.getDamageFee()));
        cost.setCostMonth(dto.getCostMonth() != null ? dto.getCostMonth() :
                LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM")));
        cost.setRemark(dto.getRemark());

        logisticsCostMapper.insert(cost);

        operationLogUtil.log("录入费用", order.getOrderNo(), "LOGISTICS_COST",
                operatorId, operatorName, "录入物流费用，总费用：" + cost.getTotalCost());
    }

    @Transactional(rollbackFor = Exception.class)
    public void updateCost(LogisticsCostDTO dto, Long operatorId, String operatorName) {
        LogisticsCost cost = logisticsCostMapper.selectById(dto.getId());
        if (cost == null) {
            throw new BusinessException("费用记录不存在");
        }

        cost.setStorageFee(dto.getStorageFee() != null ? dto.getStorageFee() : cost.getStorageFee());
        cost.setSortingFee(dto.getSortingFee() != null ? dto.getSortingFee() : cost.getSortingFee());
        cost.setTransportFee(dto.getTransportFee() != null ? dto.getTransportFee() : cost.getTransportFee());
        cost.setLoadingFee(dto.getLoadingFee() != null ? dto.getLoadingFee() : cost.getLoadingFee());
        cost.setDamageFee(dto.getDamageFee() != null ? dto.getDamageFee() : cost.getDamageFee());
        cost.setTotalCost(cost.getStorageFee()
                .add(cost.getSortingFee())
                .add(cost.getTransportFee())
                .add(cost.getLoadingFee())
                .add(cost.getDamageFee()));
        cost.setRemark(dto.getRemark() != null ? dto.getRemark() : cost.getRemark());

        logisticsCostMapper.updateById(cost);

        operationLogUtil.log("更新费用", cost.getOrderNo(), "LOGISTICS_COST",
                operatorId, operatorName, "更新物流费用，总费用：" + cost.getTotalCost());
    }

    public ReconciliationResultVO reconciliation(ReconciliationDTO dto) {
        LocalDateTime startTime = dto.getStartDate() != null ?
                LocalDate.parse(dto.getStartDate()).atStartOfDay() :
                LocalDate.now().withDayOfMonth(1).atStartOfDay();
        LocalDateTime endTime = dto.getEndDate() != null ?
                LocalDate.parse(dto.getEndDate()).atTime(23, 59, 59) :
                LocalDateTime.now();

        List<LogisticsCost> costs = logisticsCostMapper.selectList(new LambdaQueryWrapper<LogisticsCost>()
                .ge(LogisticsCost::getCreateTime, startTime)
                .le(LogisticsCost::getCreateTime, endTime)
                .eq(dto.getCategoryId() != null, LogisticsCost::getCategoryId, dto.getCategoryId()));

        BigDecimal systemTotal = costs.stream()
                .map(LogisticsCost::getTotalCost)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        ReconciliationResultVO result = new ReconciliationResultVO();
        result.setPeriod(dto.getStartDate() + " 至 " + dto.getEndDate());
        result.setSystemTotal(systemTotal);
        result.setExpectedTotal(dto.getExpectedAmount() != null ? dto.getExpectedAmount() : systemTotal);
        result.setDifference(systemTotal.subtract(result.getExpectedTotal()));
        result.setDifferenceDetails(new ArrayList<>());

        if (result.getDifference().abs().compareTo(new BigDecimal("0.01")) > 0) {
            result.setReconciliationStatus("差异");
            result.setReconciliationResult("对账存在差异，差异金额：" + result.getDifference());
        } else {
            result.setReconciliationStatus("一致");
            result.setReconciliationResult("对账一致");
        }

        return result;
    }

    public List<CostStatisticsVO> getCostStatistics(String startMonth, String endMonth, Long categoryId) {
        LambdaQueryWrapper<LogisticsCost> wrapper = new LambdaQueryWrapper<>();
        if (startMonth != null && !startMonth.isEmpty()) {
            wrapper.ge(LogisticsCost::getCostMonth, startMonth);
        }
        if (endMonth != null && !endMonth.isEmpty()) {
            wrapper.le(LogisticsCost::getCostMonth, endMonth);
        }
        if (categoryId != null) {
            wrapper.eq(LogisticsCost::getCategoryId, categoryId);
        }

        List<LogisticsCost> costs = logisticsCostMapper.selectList(wrapper);

        return costs.stream()
                .collect(Collectors.groupingBy(cost ->
                        (categoryId != null ? cost.getCostMonth() + "_" + cost.getCategoryId() :
                                cost.getCostMonth())))
                .entrySet().stream()
                .map(entry -> {
                    List<LogisticsCost> groupCosts = entry.getValue();
                    CostStatisticsVO vo = new CostStatisticsVO();

                    LogisticsCost first = groupCosts.get(0);
                    vo.setCostMonth(first.getCostMonth());
                    vo.setCategoryId(first.getCategoryId());

                    if (first.getCategoryId() != null) {
                        Category category = categoryMapper.selectById(first.getCategoryId());
                        vo.setCategoryName(category != null ? category.getName() : "未知品类");
                    }

                    vo.setOrderCount(groupCosts.size());
                    vo.setStorageFee(groupCosts.stream().map(LogisticsCost::getStorageFee).reduce(BigDecimal.ZERO, BigDecimal::add));
                    vo.setSortingFee(groupCosts.stream().map(LogisticsCost::getSortingFee).reduce(BigDecimal.ZERO, BigDecimal::add));
                    vo.setTransportFee(groupCosts.stream().map(LogisticsCost::getTransportFee).reduce(BigDecimal.ZERO, BigDecimal::add));
                    vo.setLoadingFee(groupCosts.stream().map(LogisticsCost::getLoadingFee).reduce(BigDecimal.ZERO, BigDecimal::add));
                    vo.setDamageFee(groupCosts.stream().map(LogisticsCost::getDamageFee).reduce(BigDecimal.ZERO, BigDecimal::add));
                    vo.setTotalCost(groupCosts.stream().map(LogisticsCost::getTotalCost).reduce(BigDecimal.ZERO, BigDecimal::add));

                    if (vo.getOrderCount() > 0) {
                        vo.setAvgCost(vo.getTotalCost().divide(BigDecimal.valueOf(vo.getOrderCount()), 2, RoundingMode.HALF_UP));
                        vo.setCostPerOrder(vo.getAvgCost());
                    }

                    return vo;
                })
                .sorted((a, b) -> b.getCostMonth().compareTo(a.getCostMonth()))
                .collect(Collectors.toList());
    }

    public List<LogisticsCost> getCostsForExport(String costMonth, Long categoryId) {
        LambdaQueryWrapper<LogisticsCost> wrapper = new LambdaQueryWrapper<>();
        if (costMonth != null && !costMonth.isEmpty()) {
            wrapper.eq(LogisticsCost::getCostMonth, costMonth);
        }
        if (categoryId != null) {
            wrapper.eq(LogisticsCost::getCategoryId, categoryId);
        }
        wrapper.orderByDesc(LogisticsCost::getCreateTime);

        return logisticsCostMapper.selectList(wrapper);
    }

    @Transactional(rollbackFor = Exception.class)
    public LogisticsCost autoCollectLoss(Long orderId, Long operatorId, String operatorName) {
        DispatchOrder order = dispatchOrderMapper.selectById(orderId);
        if (order == null) {
            throw new BusinessException("工单不存在");
        }

        BigDecimal sortingLoss = BigDecimal.ZERO;
        BigDecimal loadingLoss = BigDecimal.ZERO;
        BigDecimal transportLoss = BigDecimal.ZERO;
        BigDecimal damageCompensation = BigDecimal.ZERO;

        if (order.getInventoryId() != null) {
            Inventory inventory = inventoryMapper.selectById(order.getInventoryId());
            if (inventory != null) {
                if (inventory.getFragileFlag() != null && inventory.getFragileFlag() == 1) {
                    sortingLoss = new BigDecimal("50");
                    loadingLoss = new BigDecimal("80");
                    transportLoss = new BigDecimal("100");
                } else {
                    sortingLoss = new BigDecimal("20");
                    loadingLoss = new BigDecimal("40");
                    transportLoss = new BigDecimal("60");
                }

                if (order.getDistance() != null && order.getDistance().compareTo(new BigDecimal("100")) > 0) {
                    transportLoss = transportLoss.multiply(new BigDecimal("1.5"));
                }

                if (inventory.getBearingLevel() != null && inventory.getBearingLevel() >= 3) {
                    sortingLoss = sortingLoss.multiply(new BigDecimal("2"));
                    loadingLoss = loadingLoss.multiply(new BigDecimal("2"));
                }
            }
        }

        LogisticsCost cost = new LogisticsCost();
        cost.setOrderId(orderId);
        cost.setOrderNo(order.getOrderNo());
        cost.setCategoryId(order.getCategoryId());
        cost.setStorageFee(BigDecimal.ZERO);
        cost.setSortingFee(sortingLoss);
        cost.setTransportFee(transportLoss);
        cost.setLoadingFee(loadingLoss);
        cost.setDamageFee(damageCompensation);
        cost.setTotalCost(sortingLoss.add(transportLoss).add(loadingLoss).add(damageCompensation));
        cost.setCostMonth(LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM")));
        cost.setRemark("系统自动归集损耗");

        logisticsCostMapper.insert(cost);

        operationLogUtil.log("损耗归集", order.getOrderNo(), "LOGISTICS_COST",
                operatorId, operatorName, "自动归集损耗费用，分拣损耗：" + sortingLoss +
                        "，装卸损耗：" + loadingLoss + "，运输损耗：" + transportLoss);

        return cost;
    }

    @Transactional(rollbackFor = Exception.class)
    public LogisticsCost accurateCalculate(Long orderId, Long operatorId, String operatorName) {
        DispatchOrder order = dispatchOrderMapper.selectById(orderId);
        if (order == null) {
            throw new BusinessException("工单不存在");
        }

        BigDecimal storageFee = BigDecimal.ZERO;
        BigDecimal sortingFee = BigDecimal.ZERO;
        BigDecimal transportFee = BigDecimal.ZERO;
        BigDecimal loadingFee = BigDecimal.ZERO;
        BigDecimal damageFee = BigDecimal.ZERO;

        if (order.getInventoryId() != null) {
            Inventory inventory = inventoryMapper.selectById(order.getInventoryId());
            if (inventory != null) {
                int storageDays = 1;
                if (order.getCreateTime() != null) {
                    storageDays = (int) java.time.Duration.between(order.getCreateTime(), LocalDateTime.now()).toDays() + 1;
                }
                BigDecimal storageUnitPrice = new BigDecimal("50");
                if (inventory.getBearingLevel() != null && inventory.getBearingLevel() >= 3) {
                    storageUnitPrice = new BigDecimal("100");
                }
                storageFee = BigDecimal.valueOf(storageDays).multiply(storageUnitPrice);

                BigDecimal sortingUnitPrice = new BigDecimal("100");
                if (inventory.getFragileFlag() != null && inventory.getFragileFlag() == 1) {
                    sortingUnitPrice = new BigDecimal("200");
                }
                sortingFee = sortingUnitPrice;

                loadingFee = new BigDecimal("80");
                if (inventory.getWeight() != null && inventory.getWeight().compareTo(new BigDecimal("5")) > 0) {
                    loadingFee = new BigDecimal("150");
                }
            }
        }

        if (order.getDistance() != null) {
            transportFee = order.getDistance().multiply(new BigDecimal("8"));
            if (order.getPriority() != null && order.getPriority() >= 3) {
                transportFee = transportFee.multiply(new BigDecimal("1.2"));
            }
        } else {
            transportFee = new BigDecimal("200");
        }

        LogisticsCost cost = new LogisticsCost();
        cost.setOrderId(orderId);
        cost.setOrderNo(order.getOrderNo());
        cost.setCategoryId(order.getCategoryId());
        cost.setStorageFee(storageFee);
        cost.setSortingFee(sortingFee);
        cost.setTransportFee(transportFee);
        cost.setLoadingFee(loadingFee);
        cost.setDamageFee(damageFee);
        cost.setTotalCost(storageFee.add(sortingFee).add(transportFee).add(loadingFee).add(damageFee));
        cost.setCostMonth(LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM")));
        cost.setRemark("精准核算物流成本");

        logisticsCostMapper.insert(cost);

        operationLogUtil.log("精准核算", order.getOrderNo(), "LOGISTICS_COST",
                operatorId, operatorName, "精准核算物流成本，仓储费：" + storageFee +
                        "，分拣费：" + sortingFee + "，运输费：" + transportFee +
                        "，装卸费：" + loadingFee + "，总费用：" + cost.getTotalCost());

        return cost;
    }

    public Page<LogisticsCost> queryCostPage(LogisticsCostQueryDTO dto) {
        LambdaQueryWrapper<LogisticsCost> wrapper = new LambdaQueryWrapper<>();

        if (dto.getOrderNo() != null && !dto.getOrderNo().isEmpty()) {
            wrapper.like(LogisticsCost::getOrderNo, dto.getOrderNo());
        }
        if (dto.getCategoryId() != null) {
            wrapper.eq(LogisticsCost::getCategoryId, dto.getCategoryId());
        }
        if (dto.getCategoryIds() != null && !dto.getCategoryIds().isEmpty()) {
            wrapper.in(LogisticsCost::getCategoryId, dto.getCategoryIds());
        }
        if (dto.getCostMonth() != null && !dto.getCostMonth().isEmpty()) {
            wrapper.eq(LogisticsCost::getCostMonth, dto.getCostMonth());
        }
        if (dto.getCostMonths() != null && !dto.getCostMonths().isEmpty()) {
            wrapper.in(LogisticsCost::getCostMonth, dto.getCostMonths());
        }
        if (dto.getMinTotalCost() != null) {
            wrapper.ge(LogisticsCost::getTotalCost, dto.getMinTotalCost());
        }
        if (dto.getMaxTotalCost() != null) {
            wrapper.le(LogisticsCost::getTotalCost, dto.getMaxTotalCost());
        }
        if (dto.getStartTime() != null) {
            wrapper.ge(LogisticsCost::getCreateTime, dto.getStartTime());
        }
        if (dto.getEndTime() != null) {
            wrapper.le(LogisticsCost::getCreateTime, dto.getEndTime());
        }

        wrapper.orderByDesc(LogisticsCost::getCreateTime);

        return logisticsCostMapper.selectPage(new Page<>(dto.getPageNum(), dto.getPageSize()), wrapper);
    }

    public LogisticsCost getCostById(Long id) {
        return logisticsCostMapper.selectById(id);
    }

    public Page<LogisticsCost> getCostPage(Integer pageNum, Integer pageSize,
                                            String costMonth, Long categoryId, String orderNo,
                                            String startDate, String endDate) {
        LambdaQueryWrapper<LogisticsCost> wrapper = new LambdaQueryWrapper<>();
        if (costMonth != null && !costMonth.isEmpty()) {
            wrapper.eq(LogisticsCost::getCostMonth, costMonth);
        }
        if (categoryId != null) {
            wrapper.eq(LogisticsCost::getCategoryId, categoryId);
        }
        if (orderNo != null && !orderNo.isEmpty()) {
            wrapper.like(LogisticsCost::getOrderNo, orderNo);
        }
        if (startDate != null && !startDate.isEmpty()) {
            wrapper.ge(LogisticsCost::getCreateTime, LocalDate.parse(startDate).atStartOfDay());
        }
        if (endDate != null && !endDate.isEmpty()) {
            wrapper.le(LogisticsCost::getCreateTime, LocalDate.parse(endDate).atTime(23, 59, 59));
        }
        wrapper.orderByDesc(LogisticsCost::getCreateTime);

        return logisticsCostMapper.selectPage(new Page<>(pageNum, pageSize), wrapper);
    }

    public List<LogisticsCost> getCostsByMonth(String costMonth) {
        return logisticsCostMapper.selectList(new LambdaQueryWrapper<LogisticsCost>()
                .eq(LogisticsCost::getCostMonth, costMonth)
                .orderByDesc(LogisticsCost::getCreateTime));
    }

    @Transactional(rollbackFor = Exception.class)
    public void generateMonthlyReport(String reportMonth, Long operatorId, String operatorName) {
        monthlyReportMapper.delete(new LambdaQueryWrapper<MonthlyReport>()
                .eq(MonthlyReport::getReportMonth, reportMonth));

        List<LogisticsCost> costs = getCostsByMonth(reportMonth);

        costs.stream()
                .collect(Collectors.groupingBy(LogisticsCost::getCategoryId))
                .forEach((categoryId, categoryCosts) -> {
                    Category category = categoryMapper.selectById(categoryId);
                    String categoryName = category != null ? category.getName() : "未知品类";

                    int totalOrders = (int) categoryCosts.stream().map(LogisticsCost::getOrderId).distinct().count();
                    int completedOrders = (int) categoryCosts.stream()
                            .filter(cost -> {
                                DispatchOrder order = dispatchOrderMapper.selectById(cost.getOrderId());
                                return order != null && OrderStatusEnum.COMPLETED.getCode().equals(order.getOrderStatus());
                            })
                            .count();

                    BigDecimal totalStorageFee = categoryCosts.stream()
                            .map(LogisticsCost::getStorageFee)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);
                    BigDecimal totalSortingFee = categoryCosts.stream()
                            .map(LogisticsCost::getSortingFee)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);
                    BigDecimal totalTransportFee = categoryCosts.stream()
                            .map(LogisticsCost::getTransportFee)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);
                    BigDecimal totalLoadingFee = categoryCosts.stream()
                            .map(LogisticsCost::getLoadingFee)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);
                    BigDecimal totalDamageFee = categoryCosts.stream()
                            .map(LogisticsCost::getDamageFee)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);
                    BigDecimal totalCost = totalStorageFee
                            .add(totalSortingFee)
                            .add(totalTransportFee)
                            .add(totalLoadingFee)
                            .add(totalDamageFee);

                    MonthlyReport report = new MonthlyReport();
                    report.setReportMonth(reportMonth);
                    report.setCategoryId(categoryId);
                    report.setCategoryName(categoryName);
                    report.setTotalOrders(totalOrders);
                    report.setCompletedOrders(completedOrders);
                    report.setTotalStorageFee(totalStorageFee);
                    report.setTotalSortingFee(totalSortingFee);
                    report.setTotalTransportFee(totalTransportFee);
                    report.setTotalLoadingFee(totalLoadingFee);
                    report.setTotalDamageFee(totalDamageFee);
                    report.setTotalCost(totalCost);
                    report.setStatus(1);

                    monthlyReportMapper.insert(report);
                });

        operationLogUtil.log("生成月报", reportMonth, "MONTHLY_REPORT",
                operatorId, operatorName, "生成" + reportMonth + "月度物流报表");
    }

    public Page<MonthlyReport> getMonthlyReportPage(Integer pageNum, Integer pageSize, String reportMonth) {
        LambdaQueryWrapper<MonthlyReport> wrapper = new LambdaQueryWrapper<>();
        if (reportMonth != null && !reportMonth.isEmpty()) {
            wrapper.eq(MonthlyReport::getReportMonth, reportMonth);
        }
        wrapper.orderByDesc(MonthlyReport::getReportMonth);

        return monthlyReportMapper.selectPage(new Page<>(pageNum, pageSize), wrapper);
    }

    @Transactional(rollbackFor = Exception.class)
    public void confirmReport(Long reportId, Long operatorId, String operatorName) {
        MonthlyReport report = monthlyReportMapper.selectById(reportId);
        if (report == null) {
            throw new BusinessException("报表不存在");
        }
        report.setStatus(2);
        monthlyReportMapper.updateById(report);

        operationLogUtil.log("确认报表", report.getReportMonth(), "MONTHLY_REPORT",
                operatorId, operatorName, "确认" + report.getReportMonth() + "月度报表");
    }
}
