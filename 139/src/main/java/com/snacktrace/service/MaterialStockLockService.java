package com.snacktrace.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.snacktrace.entity.MaterialStockLock;
import com.snacktrace.mapper.MaterialStockLockMapper;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class MaterialStockLockService extends ServiceImpl<MaterialStockLockMapper, MaterialStockLock> {

    public boolean lockStock(Long workOrderId, Long materialId, Long batchId,
                              BigDecimal quantity, Long operatorId, String operatorName) {
        MaterialStockLock lock = new MaterialStockLock();
        lock.setWorkOrderId(workOrderId);
        lock.setMaterialId(materialId);
        lock.setBatchId(batchId);
        lock.setLockQuantity(quantity);
        lock.setLockStatus(1);
        lock.setOperatorId(operatorId);
        lock.setOperatorName(operatorName);
        lock.setLockTime(LocalDateTime.now());
        lock.setCreateTime(LocalDateTime.now());
        return save(lock);
    }

    public boolean releaseStock(Long workOrderId) {
        LambdaQueryWrapper<MaterialStockLock> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(MaterialStockLock::getWorkOrderId, workOrderId)
               .eq(MaterialStockLock::getLockStatus, 1);
        List<MaterialStockLock> locks = list(wrapper);

        for (MaterialStockLock lock : locks) {
            lock.setLockStatus(2);
            lock.setReleaseTime(LocalDateTime.now());
        }
        return updateBatchById(locks);
    }

    public boolean confirmUseStock(Long workOrderId) {
        LambdaQueryWrapper<MaterialStockLock> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(MaterialStockLock::getWorkOrderId, workOrderId)
               .eq(MaterialStockLock::getLockStatus, 1);
        List<MaterialStockLock> locks = list(wrapper);

        for (MaterialStockLock lock : locks) {
            lock.setLockStatus(3);
        }
        return updateBatchById(locks);
    }

    public List<MaterialStockLock> getLocksByWorkOrderId(Long workOrderId) {
        LambdaQueryWrapper<MaterialStockLock> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(MaterialStockLock::getWorkOrderId, workOrderId);
        return list(wrapper);
    }
}
