package com.ancientpaper.service;

import com.ancientpaper.entity.MaterialLockRecord;
import com.ancientpaper.entity.ProductionCost;
import com.ancientpaper.entity.ProductionOrder;
import com.ancientpaper.exception.BusinessException;
import com.ancientpaper.mapper.MaterialLockRecordMapper;
import com.ancientpaper.mapper.ProductionCostMapper;
import com.ancientpaper.mapper.ProductionOrderMapper;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductionCostService {

    private final ProductionCostMapper costMapper;
    private final ProductionOrderMapper orderMapper;
    private final MaterialLockRecordMapper lockRecordMapper;

    @Transactional(rollbackFor = Exception.class)
    public ProductionCost calculateProductionCost(Long orderId, BigDecimal actualQuantity,
                                                   BigDecimal laborCost, BigDecimal workHourCost,
                                                   BigDecimal waterCost, BigDecimal energyCost,
                                                   BigDecimal equipmentLoss, BigDecimal wasteRate,
                                                   String remarks) {
        ProductionOrder order = orderMapper.selectById(orderId);
        if (order == null) {
            throw new BusinessException("工单不存在");
        }

        List<MaterialLockRecord> lockRecords = lockRecordMapper.selectList(
            new LambdaQueryWrapper<MaterialLockRecord>()
                .eq(MaterialLockRecord::getOrderId, orderId)
                .eq(MaterialLockRecord::getLockStatus, 2)
        );

        BigDecimal totalMaterialCost = BigDecimal.ZERO;
        for (MaterialLockRecord record : lockRecords) {
            totalMaterialCost = totalMaterialCost.add(record.getLockQuantity().multiply(BigDecimal.valueOf(10)));
        }

        BigDecimal totalCost = totalMaterialCost
            .add(laborCost)
            .add(workHourCost)
            .add(waterCost)
            .add(energyCost)
            .add(equipmentLoss);

        BigDecimal unitCost = totalCost.divide(actualQuantity, 2, RoundingMode.HALF_UP);

        ProductionCost cost = new ProductionCost();
        cost.setOrderId(orderId);
        cost.setCategoryId(order.getCategoryId());
        cost.setMaterialCost(totalMaterialCost);
        cost.setLaborCost(laborCost);
        cost.setWorkHourCost(workHourCost);
        cost.setWaterCost(waterCost);
        cost.setEnergyCost(energyCost);
        cost.setEquipmentLoss(equipmentLoss);
        cost.setWasteRate(wasteRate);
        cost.setTotalCost(totalCost);
        cost.setUnitCost(unitCost);
        cost.setProductionQuantity(actualQuantity);
        cost.setRemarks(remarks);
        cost.setCreateTime(LocalDateTime.now());
        cost.setUpdateTime(LocalDateTime.now());

        costMapper.insert(cost);
        return cost;
    }

    public ProductionCost getCostByOrderId(Long orderId) {
        return costMapper.selectOne(new LambdaQueryWrapper<ProductionCost>()
                .eq(ProductionCost::getOrderId, orderId));
    }

    public List<ProductionCost> getCostList(Long categoryId, LocalDateTime startTime, LocalDateTime endTime) {
        LambdaQueryWrapper<ProductionCost> wrapper = new LambdaQueryWrapper<>();
        if (categoryId != null) {
            wrapper.eq(ProductionCost::getCategoryId, categoryId);
        }
        if (startTime != null) {
            wrapper.ge(ProductionCost::getCreateTime, startTime);
        }
        if (endTime != null) {
            wrapper.le(ProductionCost::getCreateTime, endTime);
        }
        wrapper.orderByDesc(ProductionCost::getCreateTime);
        return costMapper.selectList(wrapper);
    }
}
