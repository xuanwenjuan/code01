package com.valve.manufacture.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.valve.manufacture.entity.WorkOrderMaterial;
import com.valve.manufacture.exception.BusinessException;
import com.valve.manufacture.mapper.WorkOrderMaterialMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class WorkOrderMaterialService extends ServiceImpl<WorkOrderMaterialMapper, WorkOrderMaterial> {

    private final MaterialBatchService materialBatchService;
    private final MaterialLockService materialLockService;

    public List<WorkOrderMaterial> getByWorkOrderId(Long workOrderId) {
        return list(new LambdaQueryWrapper<WorkOrderMaterial>()
                .eq(WorkOrderMaterial::getWorkOrderId, workOrderId)
                .eq(WorkOrderMaterial::getDeleted, 0)
                .orderByDesc(WorkOrderMaterial::getCreateTime));
    }

    @Transactional(rollbackFor = Exception.class)
    public WorkOrderMaterial receiveMaterial(WorkOrderMaterial material) {
        if (material.getBatchId() != null) {
            materialLockService.useLockedMaterial(
                    material.getWorkOrderId(),
                    material.getMaterialId(),
                    material.getBatchId(),
                    material.getQuantity()
            );
            materialBatchService.useBatch(material.getBatchId(), material.getQuantity(), material.getWorkOrderId());
        }

        material.setReceiveTime(LocalDateTime.now());
        if (material.getUnitPrice() != null && material.getQuantity() != null) {
            material.setTotalPrice(material.getUnitPrice().multiply(material.getQuantity()));
        }
        save(material);

        return material;
    }

    @Transactional(rollbackFor = Exception.class)
    public void returnMaterial(Long workOrderMaterialId, BigDecimal quantity, String reason) {
        WorkOrderMaterial material = getById(workOrderMaterialId);
        if (material == null) {
            throw new BusinessException("用料记录不存在");
        }
        if (quantity.compareTo(material.getQuantity()) > 0) {
            throw new BusinessException("退料数量不能超过领用数量");
        }

        if (material.getBatchId() != null) {
            materialBatchService.returnBatch(material.getBatchId(), quantity, material.getReceiverId(), reason);
        }
    }

    @Transactional(rollbackFor = Exception.class)
    public void autoLockMaterial(Long workOrderId, Long materialId, Long batchId, BigDecimal quantity, Long operatorId) {
        materialLockService.lockMaterial(workOrderId, materialId, batchId, quantity, operatorId);
    }

    @Transactional(rollbackFor = Exception.class)
    public void releaseMaterialLock(Long workOrderId, String reason) {
        materialLockService.releaseAllByWorkOrder(workOrderId, reason);
    }

    public BigDecimal getTotalMaterialCost(Long workOrderId) {
        List<WorkOrderMaterial> materials = getByWorkOrderId(workOrderId);
        return materials.stream()
                .map(m -> m.getTotalPrice() != null ? m.getTotalPrice() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
