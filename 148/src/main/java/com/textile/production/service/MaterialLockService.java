package com.textile.production.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.textile.production.common.Result;
import com.textile.production.common.ResultCode;
import com.textile.production.entity.MaterialLock;
import com.textile.production.entity.RawMaterial;
import com.textile.production.entity.RawMaterialBatch;
import com.textile.production.exception.BusinessException;
import com.textile.production.mapper.MaterialLockMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MaterialLockService extends ServiceImpl<MaterialLockMapper, MaterialLock> {

    private final RawMaterialService materialService;
    private final RawMaterialBatchService batchService;

    @Transactional(rollbackFor = Exception.class)
    public Result<Void> lockMaterial(Long orderId, Long materialId, Long batchId, BigDecimal quantity, String remark) {
        if (batchId != null) {
            RawMaterialBatch batch = batchService.getById(batchId);
            if (batch == null || batch.getStatus() == 0) {
                throw new BusinessException(ResultCode.DATA_NOT_EXIST.getCode(), "批次不存在或已用完");
            }

            BigDecimal lockedQuantity = getLockedQuantityByBatch(batchId);
            BigDecimal available = batch.getQuantity().subtract(lockedQuantity);
            if (available.compareTo(quantity) < 0) {
                throw new BusinessException(ResultCode.STOCK_NOT_ENOUGH.getCode(),
                        "批次可用库存不足，可用：" + available + "，需要：" + quantity);
            }
        } else {
            RawMaterial material = materialService.getById(materialId);
            if (material == null) {
                throw new BusinessException(ResultCode.DATA_NOT_EXIST);
            }

            BigDecimal lockedQuantity = getLockedQuantityByMaterial(materialId);
            BigDecimal available = material.getTotalQuantity().subtract(lockedQuantity);
            if (available.compareTo(quantity) < 0) {
                throw new BusinessException(ResultCode.STOCK_NOT_ENOUGH.getCode(),
                        "原料可用库存不足，可用：" + available + "，需要：" + quantity);
            }
        }

        MaterialLock lock = new MaterialLock();
        lock.setOrderId(orderId);
        lock.setMaterialId(materialId);
        lock.setBatchId(batchId);
        lock.setLockQuantity(quantity);
        lock.setLockStatus("LOCKED");
        lock.setLockTime(LocalDateTime.now());
        lock.setRemark(remark);
        save(lock);

        return Result.success("库存锁定成功");
    }

    @Transactional(rollbackFor = Exception.class)
    public Result<Void> releaseLock(Long lockId) {
        MaterialLock lock = getById(lockId);
        if (lock == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }
        if (!"LOCKED".equals(lock.getLockStatus())) {
            return Result.fail("该锁定记录已使用或已释放");
        }

        lock.setLockStatus("RELEASED");
        lock.setReleaseTime(LocalDateTime.now());
        updateById(lock);

        return Result.success("库存已释放");
    }

    @Transactional(rollbackFor = Exception.class)
    public Result<Void> releaseLockByOrder(Long orderId) {
        LambdaQueryWrapper<MaterialLock> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(MaterialLock::getOrderId, orderId)
                .eq(MaterialLock::getLockStatus, "LOCKED");
        List<MaterialLock> locks = list(wrapper);

        for (MaterialLock lock : locks) {
            lock.setLockStatus("RELEASED");
            lock.setReleaseTime(LocalDateTime.now());
            updateById(lock);
        }

        return Result.success("工单库存已释放");
    }

    @Transactional(rollbackFor = Exception.class)
    public Result<Void> confirmLockUsed(Long lockId) {
        MaterialLock lock = getById(lockId);
        if (lock == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }
        if (!"LOCKED".equals(lock.getLockStatus())) {
            return Result.fail("该锁定记录状态异常");
        }

        lock.setLockStatus("USED");
        updateById(lock);

        return Result.success("已确认使用");
    }

    public BigDecimal getLockedQuantityByMaterial(Long materialId) {
        LambdaQueryWrapper<MaterialLock> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(MaterialLock::getMaterialId, materialId)
                .eq(MaterialLock::getLockStatus, "LOCKED");
        List<MaterialLock> locks = list(wrapper);
        return locks.stream()
                .map(MaterialLock::getLockQuantity)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public BigDecimal getLockedQuantityByBatch(Long batchId) {
        LambdaQueryWrapper<MaterialLock> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(MaterialLock::getBatchId, batchId)
                .eq(MaterialLock::getLockStatus, "LOCKED");
        List<MaterialLock> locks = list(wrapper);
        return locks.stream()
                .map(MaterialLock::getLockQuantity)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public Result<List<MaterialLock>> getLocksByOrder(Long orderId) {
        LambdaQueryWrapper<MaterialLock> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(MaterialLock::getOrderId, orderId)
                .orderByDesc(MaterialLock::getCreateTime);
        return Result.success(list(wrapper));
    }
}
