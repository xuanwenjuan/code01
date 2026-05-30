package com.plastic.injection.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.plastic.injection.annotation.OperationLog;
import com.plastic.injection.common.ResultCode;
import com.plastic.injection.context.UserContext;
import com.plastic.injection.dto.CostStatisticsDTO;
import com.plastic.injection.enums.OrderStatusEnum;
import com.plastic.injection.exception.BusinessException;
import com.plastic.injection.mapper.CostAccountingMapper;
import com.plastic.injection.mapper.OrderMaterialMapper;
import com.plastic.injection.mapper.ProductionOrderMapper;
import com.plastic.injection.po.CostAccountingPO;
import com.plastic.injection.po.OrderMaterialPO;
import com.plastic.injection.po.ProductionOrderPO;
import com.plastic.injection.vo.CostAccountingVO;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CostAccountingService {

    private final CostAccountingMapper costAccountingMapper;
    private final ProductionOrderMapper productionOrderMapper;
    private final OrderMaterialMapper orderMaterialMapper;

    @Transactional(rollbackFor = Exception.class)
    @OperationLog(module = "成本核算", description = "生成工单成本核算")
    public Long generateCostAccounting(Long orderId, BigDecimal machineCostPerHour,
                                        BigDecimal laborCostPerHour, BigDecimal energyCostPerHour,
                                        BigDecimal maintenanceCost, BigDecimal otherCost) {
        ProductionOrderPO order = productionOrderMapper.selectById(orderId);
        if (order == null) {
            throw new BusinessException(ResultCode.ORDER_NOT_FOUND);
        }
        if (!OrderStatusEnum.FINISHED.getCode().equals(order.getOrderStatus())) {
            throw new BusinessException(ResultCode.ORDER_STATUS_ERROR.getCode(), "工单未完成，无法生成成本核算");
        }

        String operator = UserContext.getUsername();

        if (costAccountingMapper.selectCount(
                new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<CostAccountingPO>()
                        .eq(CostAccountingPO::getOrderId, orderId)
        ) > 0) {
            throw new BusinessException(ResultCode.COST_ALREADY_EXISTS);
        }

        List<OrderMaterialPO> materials = orderMaterialMapper.selectByOrderId(orderId);

        BigDecimal totalMaterialCost = materials.stream()
                .map(m -> m.getTotalCost() != null ? m.getTotalCost() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long totalMinutes = 0;
        if (order.getActualStartTime() != null && order.getActualEndTime() != null) {
            totalMinutes = java.time.Duration.between(order.getActualStartTime(), order.getActualEndTime()).toMinutes();
        } else {
            if (order.getDryingTime() != null) totalMinutes += order.getDryingTime();
            if (order.getMoldInstallTime() != null) totalMinutes += order.getMoldInstallTime();
            if (order.getInjectionCycle() != null) totalMinutes += order.getInjectionCycle();
            if (order.getCoolingTime() != null) totalMinutes += order.getCoolingTime();
            if (order.getTrimmingTime() != null) totalMinutes += order.getTrimmingTime();
        }

        BigDecimal totalHours = BigDecimal.valueOf(totalMinutes).divide(BigDecimal.valueOf(60), 4, RoundingMode.HALF_UP);
        BigDecimal totalMachineCost = totalHours.multiply(machineCostPerHour != null ? machineCostPerHour : BigDecimal.ZERO);
        BigDecimal totalLaborCost = totalHours.multiply(laborCostPerHour != null ? laborCostPerHour : BigDecimal.ZERO);
        BigDecimal totalEnergyCost = totalHours.multiply(energyCostPerHour != null ? energyCostPerHour : BigDecimal.ZERO);

        BigDecimal totalProductionQuantity = order.getActualQuantity().add(order.getDefectiveQuantity() != null ? order.getDefectiveQuantity() : BigDecimal.ZERO);
        BigDecimal defectiveRate = totalProductionQuantity.compareTo(BigDecimal.ZERO) > 0
                ? order.getDefectiveQuantity() != null
                ? order.getDefectiveQuantity().divide(totalProductionQuantity, 4, RoundingMode.HALF_UP)
                : BigDecimal.ZERO
                : BigDecimal.ZERO;
        BigDecimal totalDefectiveCost = totalMaterialCost.multiply(defectiveRate);

        BigDecimal totalCost = totalMaterialCost
                .add(totalMachineCost)
                .add(totalLaborCost)
                .add(totalDefectiveCost)
                .add(totalEnergyCost)
                .add(maintenanceCost != null ? maintenanceCost : BigDecimal.ZERO)
                .add(otherCost != null ? otherCost : BigDecimal.ZERO);

        BigDecimal unitCost = order.getActualQuantity().compareTo(BigDecimal.ZERO) > 0
                ? totalCost.divide(order.getActualQuantity(), 4, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        CostAccountingPO po = new CostAccountingPO();
        po.setOrderId(orderId);
        po.setOrderNo(order.getOrderNo());
        po.setProductId(order.getProductId());
        po.setProductName(order.getProductName());
        po.setCategoryId(order.getCategoryId());
        po.setProductionQuantity(order.getActualQuantity());
        po.setMaterialCost(totalMaterialCost);
        po.setMachineCost(totalMachineCost);
        po.setLaborCost(totalLaborCost);
        po.setDefectiveCost(totalDefectiveCost);
        po.setEnergyCost(totalEnergyCost);
        po.setMaintenanceCost(maintenanceCost != null ? maintenanceCost : BigDecimal.ZERO);
        po.setOtherCost(otherCost != null ? otherCost : BigDecimal.ZERO);
        po.setTotalCost(totalCost);
        po.setUnitCost(unitCost);
        po.setMaterialLossRate(calculateMaterialLossRate(materials));
        po.setDefectiveRate(defectiveRate);
        po.setAccountingDate(LocalDate.now());
        po.setCreateBy(operator);
        po.setUpdateBy(operator);

        costAccountingMapper.insert(po);

        order.setMaterialCost(totalMaterialCost);
        order.setMachineCost(totalMachineCost);
        order.setLaborCost(totalLaborCost);
        order.setDefectiveCost(totalDefectiveCost);
        order.setEnergyCost(totalEnergyCost);
        order.setMaintenanceCost(maintenanceCost != null ? maintenanceCost : BigDecimal.ZERO);
        order.setOtherCost(otherCost != null ? otherCost : BigDecimal.ZERO);
        order.setTotalCost(totalCost);
        order.setUpdateBy(operator);
        productionOrderMapper.updateById(order);

        return po.getId();
    }

    private BigDecimal calculateMaterialLossRate(List<OrderMaterialPO> materials) {
        BigDecimal totalPlanQty = BigDecimal.ZERO;
        BigDecimal totalActualQty = BigDecimal.ZERO;

        for (OrderMaterialPO material : materials) {
            totalPlanQty = totalPlanQty.add(material.getPlanQuantity() != null ? material.getPlanQuantity() : BigDecimal.ZERO);
            totalActualQty = totalActualQty.add(material.getActualQuantity() != null ? material.getActualQuantity() : BigDecimal.ZERO);
        }

        if (totalPlanQty.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }

        return totalPlanQty.subtract(totalActualQty).divide(totalPlanQty, 4, RoundingMode.HALF_UP);
    }

    public Page<CostAccountingVO> pageQuery(Integer pageNum, Integer pageSize, Long categoryId,
                                             LocalDate startDate, LocalDate endDate) {
        com.baomidou.mybatisplus.extension.plugins.pagination.Page<CostAccountingPO> page =
                new com.baomidou.mybatisplus.extension.plugins.pagination.Page<>(pageNum, pageSize);

        com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<CostAccountingPO> wrapper =
                new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<>();

        if (categoryId != null) {
            wrapper.eq(CostAccountingPO::getCategoryId, categoryId);
        }
        if (startDate != null) {
            wrapper.ge(CostAccountingPO::getAccountingDate, startDate);
        }
        if (endDate != null) {
            wrapper.le(CostAccountingPO::getAccountingDate, endDate);
        }
        wrapper.orderByDesc(CostAccountingPO::getCreateTime);

        com.baomidou.mybatisplus.extension.plugins.pagination.Page<CostAccountingPO> resultPage =
                costAccountingMapper.selectPage(page, wrapper);

        Page<CostAccountingVO> voPage = new Page<>(resultPage.getCurrent(), resultPage.getSize(), resultPage.getTotal());
        List<CostAccountingVO> voList = resultPage.getRecords().stream()
                .map(this::convertToVO)
                .collect(Collectors.toList());
        voPage.setRecords(voList);

        return voPage;
    }

    public CostAccountingVO getById(Long id) {
        CostAccountingPO po = costAccountingMapper.selectById(id);
        if (po == null) {
            throw new BusinessException(ResultCode.NOT_FOUND);
        }
        return convertToVO(po);
    }

    public CostStatisticsDTO getStatistics(LocalDate startDate, LocalDate endDate) {
        com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<CostAccountingPO> wrapper =
                new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<>();

        if (startDate != null) {
            wrapper.ge(CostAccountingPO::getAccountingDate, startDate);
        }
        if (endDate != null) {
            wrapper.le(CostAccountingPO::getAccountingDate, endDate);
        }

        List<CostAccountingPO> list = costAccountingMapper.selectList(wrapper);

        CostStatisticsDTO statistics = new CostStatisticsDTO();
        statistics.setTotalOrders(list.size());

        BigDecimal totalMaterialCost = BigDecimal.ZERO;
        BigDecimal totalMachineCost = BigDecimal.ZERO;
        BigDecimal totalLaborCost = BigDecimal.ZERO;
        BigDecimal totalDefectiveCost = BigDecimal.ZERO;
        BigDecimal totalCost = BigDecimal.ZERO;
        BigDecimal totalProductionQuantity = BigDecimal.ZERO;

        for (CostAccountingPO po : list) {
            totalMaterialCost = totalMaterialCost.add(po.getMaterialCost() != null ? po.getMaterialCost() : BigDecimal.ZERO);
            totalMachineCost = totalMachineCost.add(po.getMachineCost() != null ? po.getMachineCost() : BigDecimal.ZERO);
            totalLaborCost = totalLaborCost.add(po.getLaborCost() != null ? po.getLaborCost() : BigDecimal.ZERO);
            totalDefectiveCost = totalDefectiveCost.add(po.getDefectiveCost() != null ? po.getDefectiveCost() : BigDecimal.ZERO);
            totalCost = totalCost.add(po.getTotalCost() != null ? po.getTotalCost() : BigDecimal.ZERO);
            totalProductionQuantity = totalProductionQuantity.add(po.getProductionQuantity() != null ? po.getProductionQuantity() : BigDecimal.ZERO);
        }

        statistics.setTotalMaterialCost(totalMaterialCost);
        statistics.setTotalMachineCost(totalMachineCost);
        statistics.setTotalLaborCost(totalLaborCost);
        statistics.setTotalDefectiveCost(totalDefectiveCost);
        statistics.setTotalCost(totalCost);
        statistics.setTotalProductionQuantity(totalProductionQuantity);

        if (totalProductionQuantity.compareTo(BigDecimal.ZERO) > 0) {
            statistics.setAvgUnitCost(totalCost.divide(totalProductionQuantity, 4, RoundingMode.HALF_UP));
        } else {
            statistics.setAvgUnitCost(BigDecimal.ZERO);
        }

        return statistics;
    }

    public List<Map<String, Object>> getCostTrend(LocalDate startDate, LocalDate endDate) {
        if (startDate == null) {
            startDate = LocalDate.now().minusMonths(6);
        }
        if (endDate == null) {
            endDate = LocalDate.now();
        }

        com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<CostAccountingPO> wrapper =
                new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<>();
        wrapper.ge(CostAccountingPO::getAccountingDate, startDate)
                .le(CostAccountingPO::getAccountingDate, endDate)
                .orderByAsc(CostAccountingPO::getAccountingDate);

        List<CostAccountingPO> list = costAccountingMapper.selectList(wrapper);

        Map<LocalDate, List<CostAccountingPO>> groupedByDate = new HashMap<>();
        for (CostAccountingPO po : list) {
            LocalDate date = po.getAccountingDate() != null ? po.getAccountingDate() : LocalDate.now();
            groupedByDate.computeIfAbsent(date, k -> new ArrayList<>()).add(po);
        }

        List<Map<String, Object>> result = new ArrayList<>();
        for (Map.Entry<LocalDate, List<CostAccountingPO>> entry : groupedByDate.entrySet()) {
            Map<String, Object> item = new HashMap<>();
            item.put("date", entry.getKey().toString());

            BigDecimal totalCost = entry.getValue().stream()
                    .map(p -> p.getTotalCost() != null ? p.getTotalCost() : BigDecimal.ZERO)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            item.put("totalCost", totalCost);
            item.put("orderCount", entry.getValue().size());

            result.add(item);
        }

        return result;
    }

    private CostAccountingVO convertToVO(CostAccountingPO po) {
        CostAccountingVO vo = new CostAccountingVO();
        BeanUtils.copyProperties(po, vo);
        return vo;
    }

    @Transactional(rollbackFor = Exception.class)
    @OperationLog(module = "成本核算", description = "删除成本核算")
    public void deleteById(Long id) {
        costAccountingMapper.deleteById(id);
    }
}
