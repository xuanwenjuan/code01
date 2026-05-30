package com.valve.manufacture.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.valve.manufacture.entity.MaterialBatch;
import com.valve.manufacture.entity.MaterialLock;
import com.valve.manufacture.exception.BusinessException;
import com.valve.manufacture.mapper.MaterialLockMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MaterialLockService extends ServiceImpl<MaterialLockMapper, MaterialLock> {

    private final MaterialBatchService materialBatchService;

    @Transactional(rollbackFor = Exception.class)
    public void lockMaterial(Long workOrderId, Long materialId, Long batchId, BigDecimal quantity, Long operatorId) {
        MaterialBatch batch = materialBatchService.getById(batchId);
        if (batch == null) {
            throw new BusinessException("批次不存在");
        }
        if (batch.getStatus() == 0) {
            throw new BusinessException("批次已用完");
        }

        BigDecimal lockedQuantity = getLockedQuantityByBatch(batchId);
        BigDecimal available = batch.getQuantity().subtract(lockedQuantity);
        if (available.compareTo(quantity) < 0) {
            throw new BusinessException("批次可用数量不足，可用：" + available);
        }

        MaterialLock lock = new MaterialLock();
        lock.setWorkOrderId(workOrderId);
        lock.setMaterialId(materialId);
        lock.setBatchId(batchId);
        lock.setLockQuantity(quantity);
        lock.setUsedQuantity(BigDecimal.ZERO);
        lock.setReleaseQuantity(BigDecimal.ZERO);
        lock.setStatus("LOCKED");
        lock.setLockTime(LocalDateTime.now());
        lock.setOperatorId(operatorId);
        save(lock);
    }

    @Transactional(rollbackFor = Exception.class)
    public void useLockedMaterial(Long workOrderId, Long materialId, Long batchId, BigDecimal quantity) {
        MaterialLock lock = getOne(new LambdaQueryWrapper<MaterialLock>()
                .eq(MaterialLock::getWorkOrderId, workOrderId)
                .eq(MaterialLock::getMaterialId, materialId)
                .eq(MaterialLock::getBatchId, batchId)
                .eq(MaterialLock::getStatus, "LOCKED")
                .last("LIMIT 1"));

        if (lock == null) {
            throw new BusinessException("未找到锁定记录");
        }

        BigDecimal remainingLock = lock.getLockQuantity().subtract(lock.getUsedQuantity());
        if (remainingLock.compareTo(quantity) < 0) {
            throw new BusinessException("锁定数量不足，剩余锁定：" + remainingLock);
        }

        lock.setUsedQuantity(lock.getUsedQuantity().add(quantity));
        if (lock.getUsedQuantity().compareTo(lock.getLockQuantity()) >= 0) {
            lock.setStatus("USED");
        }
        updateById(lock);
    }

    @Transactional(rollbackFor = Exception.class)
    public void releaseLock(Long workOrderId, Long materialId, Long batchId, BigDecimal quantity, String reason) {
        MaterialLock lock = getOne(new LambdaQueryWrapper<MaterialLock>()
                .eq(MaterialLock::getWorkOrderId, workOrderId)
                .eq(MaterialLock::getMaterialId, materialId)
                .eq(MaterialLock::getBatchId, batchId)
                .eq(MaterialLock::getStatus, "LOCKED")
                .last("LIMIT 1"));

        if (lock == null) {
            throw new BusinessException("未找到锁定记录");
        }

        BigDecimal remainingLock = lock.getLockQuantity().subtract(lock.getUsedQuantity()).subtract(lock.getReleaseQuantity());
        if (remainingLock.compareTo(quantity) < 0) {
            throw new BusinessException("可释放数量不足，可释放：" + remainingLock);
        }

        lock.setReleaseQuantity(lock.getReleaseQuantity().add(quantity));
        if (lock.getLockQuantity().compareTo(lock.getUsedQuantity().add(lock.getReleaseQuantity())) <= 0) {
            lock.setStatus("RELEASED");
            lock.setReleaseTime(LocalDateTime.now());
        }
        lock.setRemark(reason);
        updateById(lock);
    }

    @Transactional(rollbackFor = Exception.class)
    public void releaseAllByWorkOrder(Long workOrderId, String reason) {
        List<MaterialLock> locks = list(new LambdaQueryWrapper<MaterialLock>()
                .eq(MaterialLock::getWorkOrderId, workOrderId)
                .eq(MaterialLock::getStatus, "LOCKED"));

        for (MaterialLock lock : locks) {
            lock.setReleaseQuantity(lock.getLockQuantity().subtract(lock.getUsedQuantity()));
            lock.setStatus("RELEASED");
            lock.setReleaseTime(LocalDateTime.now());
            lock.setRemark(reason);
            updateById(lock);
        }
    }

    public BigDecimal getLockedQuantityByBatch(Long batchId) {
        List<MaterialLock> locks = list(new LambdaQueryWrapper<MaterialLock>()
                .eq(MaterialLock::getBatchId, batchId)
                .eq(MaterialLock::getStatus, "LOCKED"));

        return locks.stream()
                .map(lock -> lock.getLockQuantity().subtract(lock.getUsedQuantity()).subtract(lock.getReleaseQuantity()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public BigDecimal getLockedQuantityByMaterial(Long materialId) {
        List<MaterialLock> locks = list(new LambdaQueryWrapper<MaterialLock>()
                .eq(MaterialLock::getMaterialId, materialId)
                .eq(MaterialLock::getStatus, "LOCKED"));

        return locks.stream()
                .map(lock -> lock.getLockQuantity().subtract(lock.getUsedQuantity()).subtract(lock.getReleaseQuantity()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public List<MaterialLock> getByWorkOrderId(Long workOrderId) {
        return list(new LambdaQueryWrapper<MaterialLock>()
                .eq(MaterialLock::getWorkOrderId, workOrderId)
                .orderByDesc(MaterialLock::getCreateTime));
    }

    public BigDecimal getAvailableQuantity(Long batchId) {
        MaterialBatch batch = materialBatchService.getById(batchId);
        if (batch == null) {
            return BigDecimal.ZERO;
        }
        BigDecimal locked = getLockedQuantityByBatch(batchId);
        return batch.getQuantity().subtract(locked);
    }
}