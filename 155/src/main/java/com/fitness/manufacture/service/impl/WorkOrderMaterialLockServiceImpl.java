package com.fitness.manufacture.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.fitness.manufacture.common.BusinessException;
import com.fitness.manufacture.common.ResultCode;
import com.fitness.manufacture.entity.Material;
import com.fitness.manufacture.entity.MaterialBatch;
import com.fitness.manufacture.entity.WorkOrder;
import com.fitness.manufacture.entity.WorkOrderMaterialLock;
import com.fitness.manufacture.mapper.MaterialBatchMapper;
import com.fitness.manufacture.mapper.MaterialMapper;
import com.fitness.manufacture.mapper.WorkOrderMapper;
import com.fitness.manufacture.mapper.WorkOrderMaterialLockMapper;
import com.fitness.manufacture.service.MaterialBatchService;
import com.fitness.manufacture.service.WorkOrderMaterialLockService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class WorkOrderMaterialLockServiceImpl extends ServiceImpl<WorkOrderMaterialLockMapper, WorkOrderMaterialLock> implements WorkOrderMaterialLockService {

    private final WorkOrderMaterialLockMapper workOrderMaterialLockMapper;
    private final MaterialBatchMapper materialBatchMapper;
    private final MaterialMapper materialMapper;
    private final WorkOrderMapper workOrderMapper;
    private final MaterialBatchService materialBatchService;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void lockMaterial(Long workOrderId, Long materialId, BigDecimal quantity) {
        WorkOrder workOrder = workOrderMapper.selectById(workOrderId);
        if (workOrder == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST, "工单不存在");
        }

        Material material = materialMapper.selectById(materialId);
        if (material == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST, "物料不存在");
        }

        List<MaterialBatch> availableBatches = materialBatchService.getAvailableBatches(materialId);
        BigDecimal totalAvailable = availableBatches.stream()
                .map(b -> b.getQuantity().subtract(b.getLockedQuantity() != null ? b.getLockedQuantity() : BigDecimal.ZERO))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (totalAvailable.compareTo(quantity) < 0) {
            throw new BusinessException(ResultCode.MATERIAL_NOT_ENOUGH, "物料可用库存不足，当前可用：" + totalAvailable);
        }

        BigDecimal remainToLock = quantity;
        for (MaterialBatch batch : availableBatches) {
            if (remainToLock.compareTo(BigDecimal.ZERO) <= 0) {
                break;
            }

            BigDecimal availableInBatch = batch.getQuantity().subtract(batch.getLockedQuantity() != null ? batch.getLockedQuantity() : BigDecimal.ZERO);
            BigDecimal lockThisBatch = remainToLock.min(availableInBatch);

            if (lockThisBatch.compareTo(BigDecimal.ZERO) > 0) {
                batch.setLockedQuantity((batch.getLockedQuantity() != null ? batch.getLockedQuantity() : BigDecimal.ZERO).add(lockThisBatch));
                materialBatchMapper.updateById(batch);

                WorkOrderMaterialLock lock = new WorkOrderMaterialLock();
                lock.setWorkOrderId(workOrderId);
                lock.setWorkOrderNo(workOrder.getWorkOrderNo());
                lock.setMaterialId(materialId);
                lock.setMaterialName(material.getMaterialName());
                lock.setBatchId(batch.getId());
                lock.setBatchNo(batch.getBatchNo());
                lock.setLockedQuantity(lockThisBatch);
                lock.setUnitPrice(batch.getUnitPrice());
                lock.setTotalAmount(lockThisBatch.multiply(batch.getUnitPrice()));
                lock.setStatus(1);
                workOrderMaterialLockMapper.insert(lock);

                remainToLock = remainToLock.subtract(lockThisBatch);
            }
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void releaseMaterialLock(Long workOrderId) {
        List<WorkOrderMaterialLock> locks = getLocksByWorkOrderId(workOrderId);

        for (WorkOrderMaterialLock lock : locks) {
            if (lock.getStatus() == 1) {
                MaterialBatch batch = materialBatchMapper.selectById(lock.getBatchId());
                if (batch != null) {
                    batch.setLockedQuantity(batch.getLockedQuantity().subtract(lock.getLockedQuantity()));
                    if (batch.getLockedQuantity().compareTo(BigDecimal.ZERO) < 0) {
                        batch.setLockedQuantity(BigDecimal.ZERO);
                    }
                    materialBatchMapper.updateById(batch);
                }

                lock.setStatus(0);
                lock.setRemark("已释放");
                workOrderMaterialLockMapper.updateById(lock);
            }
        }
    }

    @Override
    public List<WorkOrderMaterialLock> getLocksByWorkOrderId(Long workOrderId) {
        LambdaQueryWrapper<WorkOrderMaterialLock> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(WorkOrderMaterialLock::getWorkOrderId, workOrderId);
        return workOrderMaterialLockMapper.selectList(wrapper);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deductLockedMaterial(Long workOrderId) {
        List<WorkOrderMaterialLock> locks = getLocksByWorkOrderId(workOrderId);

        for (WorkOrderMaterialLock lock : locks) {
            if (lock.getStatus() == 1) {
                MaterialBatch batch = materialBatchMapper.selectById(lock.getBatchId());
                if (batch != null) {
                    batch.setQuantity(batch.getQuantity().subtract(lock.getLockedQuantity()));
                    batch.setLockedQuantity(batch.getLockedQuantity().subtract(lock.getLockedQuantity()));
                    if (batch.getQuantity().compareTo(BigDecimal.ZERO) == 0) {
                        batch.setStatus(0);
                    }
                    materialBatchMapper.updateById(batch);
                }

                Material material = materialMapper.selectById(lock.getMaterialId());
                if (material != null) {
                    material.setStockQuantity(material.getStockQuantity().subtract(lock.getLockedQuantity()));
                    if (material.getStockQuantity().compareTo(material.getWarningQuantity()) <= 0) {
                        material.setStatus(2);
                    }
                    materialMapper.updateById(material);
                }

                lock.setStatus(2);
                lock.setRemark("已扣减");
                workOrderMaterialLockMapper.updateById(lock);
            }
        }
    }
}
