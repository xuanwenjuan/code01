package com.radiator.management.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.radiator.management.entity.MaterialLock;
import com.radiator.management.entity.MaterialInventory;
import com.radiator.management.exception.BusinessException;
import com.radiator.management.mapper.MaterialLockMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
public class MaterialLockService extends ServiceImpl<MaterialLockMapper, MaterialLock> {

    @Autowired
    private MaterialInventoryService materialInventoryService;

    @Transactional(rollbackFor = Exception.class)
    public void lockMaterial(Long workOrderId, String workOrderNo, Long materialId,
                              BigDecimal quantity, String lockType, Long userId, String userName) {
        MaterialInventory inventory = materialInventoryService.getById(materialId);
        if (inventory == null) {
            throw BusinessException.of("物料不存在");
        }

        BigDecimal lockedQuantity = getLockedQuantity(materialId);
        BigDecimal availableQuantity = inventory.getQuantity().subtract(lockedQuantity);

        if (availableQuantity.compareTo(quantity) < 0) {
            throw BusinessException.of("物料可用库存不足，可用：" + availableQuantity + "，需要：" + quantity);
        }

        MaterialLock lock = new MaterialLock();
        lock.setWorkOrderId(workOrderId);
        lock.setWorkOrderNo(workOrderNo);
        lock.setMaterialId(materialId);
        lock.setMaterialCode(inventory.getMaterialCode());
        lock.setMaterialName(inventory.getMaterialName());
        lock.setBatchNo(inventory.getBatchNo());
        lock.setLockQuantity(quantity);
        lock.setLockType(lockType);
        lock.setStatus("LOCKED");
        lock.setLockUserId(userId);
        lock.setLockUserName(userName);
        lock.setLockTime(LocalDateTime.now());
        this.save(lock);

        log.info("物料锁定成功，工单：{}，物料：{}，数量：{}", workOrderNo, inventory.getMaterialName(), quantity);
    }

    @Transactional(rollbackFor = Exception.class)
    public void unlockMaterial(Long workOrderId, Long materialId, Long userId, String userName) {
        LambdaQueryWrapper<MaterialLock> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(MaterialLock::getWorkOrderId, workOrderId)
               .eq(MaterialLock::getMaterialId, materialId)
               .eq(MaterialLock::getStatus, "LOCKED");
        List<MaterialLock> locks = this.list(wrapper);

        for (MaterialLock lock : locks) {
            lock.setStatus("UNLOCKED");
            lock.setUnlockUserId(userId);
            lock.setUnlockUserName(userName);
            lock.setUnlockTime(LocalDateTime.now());
            this.updateById(lock);
        }

        log.info("物料解锁成功，工单：{}，物料数量：{}", workOrderId, locks.size());
    }

    @Transactional(rollbackFor = Exception.class)
    public void consumeLockedMaterial(Long workOrderId, Long materialId, BigDecimal quantity) {
        LambdaQueryWrapper<MaterialLock> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(MaterialLock::getWorkOrderId, workOrderId)
               .eq(MaterialLock::getMaterialId, materialId)
               .eq(MaterialLock::getStatus, "LOCKED")
               .orderByAsc(MaterialLock::getLockTime);
        List<MaterialLock> locks = this.list(wrapper);

        BigDecimal remaining = quantity;
        for (MaterialLock lock : locks) {
            if (remaining.compareTo(BigDecimal.ZERO) <= 0) {
                break;
            }
            if (lock.getLockQuantity().compareTo(remaining) <= 0) {
                lock.setStatus("CONSUMED");
                remaining = remaining.subtract(lock.getLockQuantity());
            } else {
                lock.setLockQuantity(lock.getLockQuantity().subtract(remaining));
                remaining = BigDecimal.ZERO;
            }
            this.updateById(lock);
        }

        if (remaining.compareTo(BigDecimal.ZERO) > 0) {
            throw BusinessException.of("锁定物料不足，缺少：" + remaining);
        }
    }

    public BigDecimal getLockedQuantity(Long materialId) {
        LambdaQueryWrapper<MaterialLock> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(MaterialLock::getMaterialId, materialId)
               .eq(MaterialLock::getStatus, "LOCKED");
        List<MaterialLock> locks = this.list(wrapper);
        return locks.stream()
                .map(MaterialLock::getLockQuantity)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public List<MaterialLock> getWorkOrderLocks(Long workOrderId) {
        LambdaQueryWrapper<MaterialLock> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(MaterialLock::getWorkOrderId, workOrderId)
               .eq(MaterialLock::getStatus, "LOCKED");
        return this.list(wrapper);
    }
}
