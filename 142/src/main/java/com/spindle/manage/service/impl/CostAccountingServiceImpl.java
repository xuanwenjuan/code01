package com.spindle.manage.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.spindle.manage.dto.*;
import com.spindle.manage.entity.*;
import com.spindle.manage.exception.BusinessException;
import com.spindle.manage.mapper.*;
import com.spindle.manage.service.CostAccountingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class CostAccountingServiceImpl extends ServiceImpl<ProductionLossRecordMapper, ProductionLossRecord> implements CostAccountingService {

    private final ProductionLossRecordMapper productionLossRecordMapper;
    private final OrderMaterialDetailMapper orderMaterialDetailMapper;
    private final ProductionOrderMapper productionOrderMapper;
    private final OrderProcessRecordMapper orderProcessRecordMapper;

    @Override
    public CostAccountingDTO calculateOrderCost(Long orderId) {
        ProductionOrder order = productionOrderMapper.selectById(orderId);
        if (order == null) {
            throw new BusinessException("工单不存在");
        }

        CostAccountingDTO dto = new CostAccountingDTO();
        dto.setOrderId(orderId);
        dto.setOrderNo(order.getOrderNo());

        LambdaQueryWrapper<OrderMaterialDetail> materialWrapper = new LambdaQueryWrapper<>();
        materialWrapper.eq(OrderMaterialDetail::getOrderId, orderId);
        List<OrderMaterialDetail> materialDetails = orderMaterialDetailMapper.selectList(materialWrapper);

        BigDecimal totalMaterialCost = BigDecimal.ZERO;
        for (OrderMaterialDetail detail : materialDetails) {
            if (detail.getTotalPrice() != null) {
                totalMaterialCost = totalMaterialCost.add(detail.getTotalPrice());
            }
        }
        dto.setTotalMaterialCost(totalMaterialCost);
        dto.setMaterialDetails(materialDetails);

        LambdaQueryWrapper<ProductionLossRecord> lossWrapper = new LambdaQueryWrapper<>();
        lossWrapper.eq(ProductionLossRecord::getOrderId, orderId);
        List<ProductionLossRecord> lossRecords = productionLossRecordMapper.selectList(lossWrapper);

        BigDecimal totalLossCost = BigDecimal.ZERO;
        for (ProductionLossRecord loss : lossRecords) {
            if (loss.getLossAmount() != null) {
                totalLossCost = totalLossCost.add(loss.getLossAmount());
            }
        }
        dto.setTotalLossCost(totalLossCost);
        dto.setLossRecords(lossRecords);

        Map<String, BigDecimal> lossTypeSummary = new HashMap<>();
        for (ProductionLossRecord loss : lossRecords) {
            String lossType = loss.getLossType();
            BigDecimal amount = loss.getLossAmount() != null ? loss.getLossAmount() : BigDecimal.ZERO;
            lossTypeSummary.put(lossType, lossTypeSummary.getOrDefault(lossType, BigDecimal.ZERO).add(amount));
        }
        dto.setLossTypeSummary(lossTypeSummary);

        BigDecimal processingCost = calculateProcessingCost(orderId);
        dto.setProcessingCost(processingCost);

        BigDecimal totalCost = totalMaterialCost.add(totalLossCost).add(processingCost);
        dto.setTotalCost(totalCost);

        log.info("工单{}成本核算完成，总成本：{}", order.getOrderNo(), totalCost);
        return dto;
    }

    @Override
    public CostSummaryDTO getPeriodCostSummary(String startDate, String endDate) {
        LocalDateTime start = LocalDate.parse(startDate, DateTimeFormatter.ISO_DATE).atStartOfDay();
        LocalDateTime end = LocalDate.parse(endDate, DateTimeFormatter.ISO_DATE).atTime(23, 59, 59);

        LambdaQueryWrapper<ProductionOrder> orderWrapper = new LambdaQueryWrapper<>();
        orderWrapper.between(ProductionOrder::getCreateTime, start, end);
        List<ProductionOrder> orders = productionOrderMapper.selectList(orderWrapper);

        CostSummaryDTO summary = new CostSummaryDTO();
        summary.setStartDate(startDate);
        summary.setEndDate(endDate);
        summary.setTotalOrderCount(orders.size());

        BigDecimal totalMaterialCost = BigDecimal.ZERO;
        BigDecimal totalLossCost = BigDecimal.ZERO;
        BigDecimal totalProcessingCost = BigDecimal.ZERO;

        for (ProductionOrder order : orders) {
            CostAccountingDTO orderCost = calculateOrderCost(order.getId());
            totalMaterialCost = totalMaterialCost.add(orderCost.getTotalMaterialCost());
            totalLossCost = totalLossCost.add(orderCost.getTotalLossCost());
            totalProcessingCost = totalProcessingCost.add(orderCost.getProcessingCost());
        }

        summary.setTotalMaterialCost(totalMaterialCost);
        summary.setTotalLossCost(totalLossCost);
        summary.setTotalProcessingCost(totalProcessingCost);
        summary.setTotalCost(totalMaterialCost.add(totalLossCost).add(totalProcessingCost));

        log.info("{}至{}期间成本汇总完成，总成本：{}", startDate, endDate, summary.getTotalCost());
        return summary;
    }

    @Override
    public IPage<ProductionLossRecord> getLossRecords(Page<ProductionLossRecord> page, ProductionLossQueryDTO dto) {
        LambdaQueryWrapper<ProductionLossRecord> wrapper = new LambdaQueryWrapper<>();
        if (dto.getOrderId() != null) {
            wrapper.eq(ProductionLossRecord::getOrderId, dto.getOrderId());
        }
        if (StringUtils.hasText(dto.getOrderNo())) {
            wrapper.like(ProductionLossRecord::getOrderNo, dto.getOrderNo());
        }
        if (dto.getProcessCode() != null) {
            wrapper.eq(ProductionLossRecord::getProcessCode, dto.getProcessCode());
        }
        if (StringUtils.hasText(dto.getLossType())) {
            wrapper.eq(ProductionLossRecord::getLossType, dto.getLossType());
        }
        if (StringUtils.hasText(dto.getStartDate()) && StringUtils.hasText(dto.getEndDate())) {
            LocalDateTime start = LocalDate.parse(dto.getStartDate(), DateTimeFormatter.ISO_DATE).atStartOfDay();
            LocalDateTime end = LocalDate.parse(dto.getEndDate(), DateTimeFormatter.ISO_DATE).atTime(23, 59, 59);
            wrapper.between(ProductionLossRecord::getCreateTime, start, end);
        }
        wrapper.orderByDesc(ProductionLossRecord::getCreateTime);
        return this.page(page, wrapper);
    }

    @Override
    public List<ProductionLossRecord> getOrderLossRecords(Long orderId) {
        LambdaQueryWrapper<ProductionLossRecord> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ProductionLossRecord::getOrderId, orderId)
                .orderByDesc(ProductionLossRecord::getCreateTime);
        return productionLossRecordMapper.selectList(wrapper);
    }

    @Override
    public BigDecimal calculateTotalLossAmount(Long orderId) {
        LambdaQueryWrapper<ProductionLossRecord> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ProductionLossRecord::getOrderId, orderId);
        List<ProductionLossRecord> lossRecords = productionLossRecordMapper.selectList(wrapper);

        BigDecimal total = BigDecimal.ZERO;
        for (ProductionLossRecord record : lossRecords) {
            if (record.getLossAmount() != null) {
                total = total.add(record.getLossAmount());
            }
        }
        return total;
    }

    @Override
    public CostSummaryDTO getCategoryCostSummary(Long categoryId, String startDate, String endDate) {
        LocalDateTime start = LocalDate.parse(startDate, DateTimeFormatter.ISO_DATE).atStartOfDay();
        LocalDateTime end = LocalDate.parse(endDate, DateTimeFormatter.ISO_DATE).atTime(23, 59, 59);

        LambdaQueryWrapper<ProductionOrder> orderWrapper = new LambdaQueryWrapper<>();
        orderWrapper.eq(ProductionOrder::getCategoryId, categoryId)
                .between(ProductionOrder::getCreateTime, start, end);
        List<ProductionOrder> orders = productionOrderMapper.selectList(orderWrapper);

        CostSummaryDTO summary = new CostSummaryDTO();
        summary.setStartDate(startDate);
        summary.setEndDate(endDate);
        summary.setTotalOrderCount(orders.size());

        BigDecimal totalMaterialCost = BigDecimal.ZERO;
        BigDecimal totalLossCost = BigDecimal.ZERO;
        BigDecimal totalProcessingCost = BigDecimal.ZERO;

        for (ProductionOrder order : orders) {
            CostAccountingDTO orderCost = calculateOrderCost(order.getId());
            totalMaterialCost = totalMaterialCost.add(orderCost.getTotalMaterialCost());
            totalLossCost = totalLossCost.add(orderCost.getTotalLossCost());
            totalProcessingCost = totalProcessingCost.add(orderCost.getProcessingCost());
        }

        summary.setTotalMaterialCost(totalMaterialCost);
        summary.setTotalLossCost(totalLossCost);
        summary.setTotalProcessingCost(totalProcessingCost);
        summary.setTotalCost(totalMaterialCost.add(totalLossCost).add(totalProcessingCost));

        log.info("分类ID:{} {}至{}期间成本汇总完成，总成本：{}", categoryId, startDate, endDate, summary.getTotalCost());
        return summary;
    }

    private BigDecimal calculateProcessingCost(Long orderId) {
        LambdaQueryWrapper<OrderProcessRecord> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(OrderProcessRecord::getOrderId, orderId);
        List<OrderProcessRecord> processRecords = orderProcessRecordMapper.selectList(wrapper);

        BigDecimal totalDuration = BigDecimal.ZERO;
        for (OrderProcessRecord record : processRecords) {
            if (record.getProcessDuration() != null) {
                totalDuration = totalDuration.add(new BigDecimal(record.getProcessDuration()));
            }
        }

        BigDecimal costPerMinute = new BigDecimal("0.5");
        return totalDuration.multiply(costPerMinute);
    }

}
