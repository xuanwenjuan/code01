package com.textile.production.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.textile.production.common.Result;
import com.textile.production.common.ResultCode;
import com.textile.production.dto.CostDetailDTO;
import com.textile.production.entity.OrderMaterial;
import com.textile.production.entity.ProductionCost;
import com.textile.production.entity.ProductionOrder;
import com.textile.production.entity.ProductionProcess;
import com.textile.production.exception.BusinessException;
import com.textile.production.mapper.ProductionCostMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ProductionCostService extends ServiceImpl<ProductionCostMapper, ProductionCost> {

    private final OrderMaterialService orderMaterialService;
    private final ProductionOrderService orderService;
    private final ProductionProcessService processService;

    public void initCost(Long orderId) {
        ProductionCost cost = new ProductionCost();
        cost.setOrderId(orderId);
        cost.setMaterialCost(BigDecimal.ZERO);
        cost.setEquipmentCost(BigDecimal.ZERO);
        cost.setLaborCost(BigDecimal.ZERO);
        cost.setDyeCost(BigDecimal.ZERO);
        cost.setProcessLossCost(BigDecimal.ZERO);
        cost.setShrinkageLossCost(BigDecimal.ZERO);
        cost.setEnergyCost(BigDecimal.ZERO);
        cost.setManagementCost(BigDecimal.ZERO);
        cost.setDefectiveCost(BigDecimal.ZERO);
        cost.setOtherCost(BigDecimal.ZERO);
        cost.setTotalCost(BigDecimal.ZERO);
        cost.setUnitCost(BigDecimal.ZERO);
        cost.setSettlementStatus(0);
        save(cost);
    }

    @Transactional(rollbackFor = Exception.class)
    public void calculateCost(Long orderId) {
        ProductionCost cost = getOne(new LambdaQueryWrapper<ProductionCost>()
                .eq(ProductionCost::getOrderId, orderId));
        if (cost == null) {
            initCost(orderId);
            cost = getOne(new LambdaQueryWrapper<ProductionCost>()
                    .eq(ProductionCost::getOrderId, orderId));
        }

        Result<List<OrderMaterial>> materialsResult = orderMaterialService.getMaterialsByOrderId(orderId);
        List<OrderMaterial> materials = materialsResult.getData();
        BigDecimal materialCost = materials.stream()
                .map(OrderMaterial::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        cost.setMaterialCost(materialCost);

        Result<List<ProductionProcess>> processesResult = processService.getProcessesByOrderId(orderId);
        List<ProductionProcess> processes = processesResult.getData();

        BigDecimal defectiveCost = processes.stream()
                .map(p -> {
                    if (p.getDefectiveQuantity() != null && p.getOutputQuantity() != null
                            && materialCost.compareTo(BigDecimal.ZERO) > 0
                            && p.getOutputQuantity().compareTo(BigDecimal.ZERO) > 0) {
                        BigDecimal unitCost = materialCost.divide(p.getOutputQuantity(), 4, RoundingMode.HALF_UP);
                        return p.getDefectiveQuantity().multiply(unitCost);
                    }
                    return BigDecimal.ZERO;
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        cost.setDefectiveCost(defectiveCost);

        BigDecimal totalCost = materialCost
                .add(cost.getEquipmentCost())
                .add(cost.getLaborCost())
                .add(cost.getDyeCost())
                .add(cost.getProcessLossCost())
                .add(cost.getShrinkageLossCost())
                .add(cost.getEnergyCost())
                .add(cost.getManagementCost())
                .add(defectiveCost)
                .add(cost.getOtherCost());
        cost.setTotalCost(totalCost);

        ProductionOrder order = orderService.getById(orderId);
        if (order != null && order.getActualQuantity() != null
                && order.getActualQuantity().compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal unitCost = totalCost.divide(order.getActualQuantity(), 4, RoundingMode.HALF_UP);
            cost.setUnitCost(unitCost);
        }

        updateById(cost);
    }

    @Transactional(rollbackFor = Exception.class)
    public Result<ProductionCost> updateCost(Long orderId, BigDecimal equipmentCost,
                                             BigDecimal laborCost, BigDecimal dyeCost,
                                             BigDecimal otherCost, String remark) {
        ProductionCost cost = getOne(new LambdaQueryWrapper<ProductionCost>()
                .eq(ProductionCost::getOrderId, orderId));
        if (cost == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }

        if (equipmentCost != null) cost.setEquipmentCost(equipmentCost);
        if (laborCost != null) cost.setLaborCost(laborCost);
        if (dyeCost != null) cost.setDyeCost(dyeCost);
        if (otherCost != null) cost.setOtherCost(otherCost);
        if (remark != null) cost.setRemark(remark);

        calculateCost(orderId);

        return Result.success("成本更新成功", cost);
    }

    @Transactional(rollbackFor = Exception.class)
    public Result<ProductionCost> updateCostDetail(CostDetailDTO dto) {
        ProductionCost cost = getOne(new LambdaQueryWrapper<ProductionCost>()
                .eq(ProductionCost::getOrderId, dto.getOrderId()));
        if (cost == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }

        if (dto.getEquipmentCost() != null) cost.setEquipmentCost(dto.getEquipmentCost());
        if (dto.getLaborCost() != null) cost.setLaborCost(dto.getLaborCost());
        if (dto.getDyeCost() != null) cost.setDyeCost(dto.getDyeCost());
        if (dto.getProcessLossCost() != null) cost.setProcessLossCost(dto.getProcessLossCost());
        if (dto.getShrinkageLossCost() != null) cost.setShrinkageLossCost(dto.getShrinkageLossCost());
        if (dto.getEnergyCost() != null) cost.setEnergyCost(dto.getEnergyCost());
        if (dto.getManagementCost() != null) cost.setManagementCost(dto.getManagementCost());
        if (dto.getDefectiveCost() != null) cost.setDefectiveCost(dto.getDefectiveCost());
        if (dto.getOtherCost() != null) cost.setOtherCost(dto.getOtherCost());
        if (dto.getRemark() != null) cost.setRemark(dto.getRemark());

        calculateCost(dto.getOrderId());

        return Result.success("成本明细更新成功", cost);
    }

    public Result<ProductionCost> getCostByOrderId(Long orderId) {
        ProductionCost cost = getOne(new LambdaQueryWrapper<ProductionCost>()
                .eq(ProductionCost::getOrderId, orderId));
        if (cost == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }
        return Result.success(cost);
    }

    public Result<IPage<ProductionCost>> getCostPage(Integer pageNum, Integer pageSize,
                                                     Integer settlementStatus,
                                                     LocalDate startDate, LocalDate endDate) {
        LambdaQueryWrapper<ProductionCost> wrapper = new LambdaQueryWrapper<>();
        if (settlementStatus != null) {
            wrapper.eq(ProductionCost::getSettlementStatus, settlementStatus);
        }
        if (startDate != null) {
            wrapper.ge(ProductionCost::getCreateTime, startDate.atStartOfDay());
        }
        if (endDate != null) {
            wrapper.le(ProductionCost::getCreateTime, endDate.atTime(23, 59, 59));
        }
        wrapper.orderByDesc(ProductionCost::getCreateTime);

        Page<ProductionCost> page = new Page<>(pageNum, pageSize);
        return Result.success(page(page, wrapper));
    }

    @Transactional(rollbackFor = Exception.class)
    public Result<Void> settleCost(Long orderId) {
        ProductionCost cost = getOne(new LambdaQueryWrapper<ProductionCost>()
                .eq(ProductionCost::getOrderId, orderId));
        if (cost == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }
        if (cost.getSettlementStatus() == 1) {
            return Result.fail("该成本已结算");
        }

        cost.setSettlementStatus(1);
        cost.setSettlementTime(LocalDateTime.now());
        updateById(cost);

        return Result.success("结算成功");
    }

    public Result<Map<String, Object>> getCostSummary(LocalDate startDate, LocalDate endDate) {
        LambdaQueryWrapper<ProductionCost> wrapper = new LambdaQueryWrapper<>();
        if (startDate != null) {
            wrapper.ge(ProductionCost::getCreateTime, startDate.atStartOfDay());
        }
        if (endDate != null) {
            wrapper.le(ProductionCost::getCreateTime, endDate.atTime(23, 59, 59));
        }
        List<ProductionCost> costs = list(wrapper);

        BigDecimal totalMaterialCost = BigDecimal.ZERO;
        BigDecimal totalEquipmentCost = BigDecimal.ZERO;
        BigDecimal totalLaborCost = BigDecimal.ZERO;
        BigDecimal totalDyeCost = BigDecimal.ZERO;
        BigDecimal totalDefectiveCost = BigDecimal.ZERO;
        BigDecimal totalOtherCost = BigDecimal.ZERO;
        BigDecimal totalCost = BigDecimal.ZERO;
        int orderCount = costs.size();
        int settledCount = 0;

        for (ProductionCost cost : costs) {
            totalMaterialCost = totalMaterialCost.add(cost.getMaterialCost());
            totalEquipmentCost = totalEquipmentCost.add(cost.getEquipmentCost());
            totalLaborCost = totalLaborCost.add(cost.getLaborCost());
            totalDyeCost = totalDyeCost.add(cost.getDyeCost());
            totalDefectiveCost = totalDefectiveCost.add(cost.getDefectiveCost());
            totalOtherCost = totalOtherCost.add(cost.getOtherCost());
            totalCost = totalCost.add(cost.getTotalCost());
            if (cost.getSettlementStatus() == 1) {
                settledCount++;
            }
        }

        Map<String, Object> summary = new HashMap<>();
        summary.put("orderCount", orderCount);
        summary.put("settledCount", settledCount);
        summary.put("totalMaterialCost", totalMaterialCost);
        summary.put("totalEquipmentCost", totalEquipmentCost);
        summary.put("totalLaborCost", totalLaborCost);
        summary.put("totalDyeCost", totalDyeCost);
        summary.put("totalDefectiveCost", totalDefectiveCost);
        summary.put("totalOtherCost", totalOtherCost);
        summary.put("totalCost", totalCost);

        return Result.success(summary);
    }

    public Result<List<Map<String, Object>>> getCostDetailReport(Integer settlementStatus,
                                                                 LocalDateTime startDate,
                                                                 LocalDateTime endDate) {
        return Result.success(baseMapper.getCostDetailReport(settlementStatus, startDate, endDate));
    }

    public Result<List<Map<String, Object>>> getCostAnalysisReport(LocalDateTime startDate,
                                                                   LocalDateTime endDate) {
        return Result.success(baseMapper.getCostAnalysisReport(startDate, endDate));
    }

    public Result<List<Map<String, Object>>> getCostByCategory(LocalDateTime startDate,
                                                               LocalDateTime endDate) {
        return Result.success(baseMapper.getCostByCategory(startDate, endDate));
    }

    public Result<List<Map<String, Object>>> getMaterialUsageTrace(Long orderId,
                                                                    Long materialId,
                                                                    LocalDateTime startDate,
                                                                    LocalDateTime endDate) {
        return Result.success(baseMapper.getMaterialUsageTrace(orderId, materialId, startDate, endDate));
    }
}
