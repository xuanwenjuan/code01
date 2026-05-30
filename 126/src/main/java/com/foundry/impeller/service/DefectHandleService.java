package com.foundry.impeller.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.foundry.impeller.entity.DefectHandle;
import com.foundry.impeller.entity.ProductionLoss;
import com.foundry.impeller.entity.ProductionWorkOrder;
import com.foundry.impeller.exception.BusinessException;
import com.foundry.impeller.mapper.DefectHandleMapper;
import com.foundry.impeller.mapper.ProductionLossMapper;
import com.foundry.impeller.mapper.ProductionWorkOrderMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class DefectHandleService {

    private final DefectHandleMapper defectHandleMapper;
    private final ProductionLossMapper productionLossMapper;
    private final ProductionWorkOrderMapper workOrderMapper;

    public Page<DefectHandle> list(int page, int size, String handleType, String status) {
        LambdaQueryWrapper<DefectHandle> wrapper = new LambdaQueryWrapper<>();
        if (handleType != null && !handleType.isEmpty()) {
            wrapper.eq(DefectHandle::getHandleType, handleType);
        }
        if (status != null && !status.isEmpty()) {
            wrapper.eq(DefectHandle::getStatus, status);
        }
        wrapper.orderByDesc(DefectHandle::getCreateTime);
        return defectHandleMapper.selectPage(new Page<>(page, size), wrapper);
    }

    public DefectHandle getById(Long id) {
        return defectHandleMapper.selectById(id);
    }

    @Transactional(rollbackFor = Exception.class)
    public void handleDefect(DefectHandle defectHandle) {
        ProductionWorkOrder workOrder = workOrderMapper.selectById(defectHandle.getWorkOrderId());
        if (workOrder == null) {
            throw new BusinessException("工单不存在");
        }

        defectHandle.setWorkOrderNo(workOrder.getWorkOrderNo());

        BigDecimal totalLoss = BigDecimal.ZERO;
        if (defectHandle.getMaterialCost() != null) {
            totalLoss = totalLoss.add(defectHandle.getMaterialCost());
        }
        if (defectHandle.getLaborCost() != null) {
            totalLoss = totalLoss.add(defectHandle.getLaborCost());
        }
        if (defectHandle.getEnergyCost() != null) {
            totalLoss = totalLoss.add(defectHandle.getEnergyCost());
        }
        defectHandle.setTotalLoss(totalLoss);
        defectHandle.setStatus("COMPLETED");

        defectHandleMapper.insert(defectHandle);

        if (workOrder.getDefectiveQuantity() == null) {
            workOrder.setDefectiveQuantity(0);
        }
        workOrder.setDefectiveQuantity(workOrder.getDefectiveQuantity() + defectHandle.getHandleQuantity());
        workOrderMapper.updateById(workOrder);

        recordProductionLoss(defectHandle, workOrder, "MATERIAL", defectHandle.getMaterialCost(), "原料损耗");
        recordProductionLoss(defectHandle, workOrder, "LABOR", defectHandle.getLaborCost(), "人工损耗");
        recordProductionLoss(defectHandle, workOrder, "ENERGY", defectHandle.getEnergyCost(), "能耗损耗");
    }

    private void recordProductionLoss(DefectHandle defectHandle, ProductionWorkOrder workOrder,
                                       String lossType, BigDecimal amount, String reason) {
        if (amount != null && amount.compareTo(BigDecimal.ZERO) > 0) {
            ProductionLoss loss = new ProductionLoss();
            loss.setWorkOrderId(workOrder.getId());
            loss.setLossType(lossType);
            loss.setTotalCost(amount);
            loss.setLossReason(reason);
            loss.setRemark(defectHandle.getDefectReason());
            productionLossMapper.insert(loss);
        }
    }

    public void update(DefectHandle defectHandle) {
        defectHandleMapper.updateById(defectHandle);
    }

    public void delete(Long id) {
        defectHandleMapper.deleteById(id);
    }
}
