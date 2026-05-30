package com.incense.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.incense.context.UserContext;
import com.incense.entity.Material;
import com.incense.entity.MaterialStockLock;
import com.incense.exception.BusinessException;
import com.incense.mapper.MaterialStockLockMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class MaterialStockLockService extends ServiceImpl<MaterialStockLockMapper, MaterialStockLock> {

    private final MaterialService materialService;
    private final RedisTemplate<String, Object> redisTemplate;

    private static final String STOCK_LOCK_KEY = "incense:stock:lock:";

    @Transactional(rollbackFor = Exception.class)
    public void lockStock(Long orderId, String orderNo, Long materialId, BigDecimal lockQuantity, String remark) {
        Material material = materialService.getById(materialId);
        if (material == null) {
            throw new BusinessException("原料不存在");
        }

        BigDecimal lockedQuantity = getLockedQuantityByMaterialId(materialId);
        BigDecimal availableQuantity = material.getStockQuantity().subtract(lockedQuantity);

        if (availableQuantity.compareTo(lockQuantity) < 0) {
            throw new BusinessException("原料库存不足，可用：" + availableQuantity + "，需要：" + lockQuantity);
        }

        MaterialStockLock lock = new MaterialStockLock();
        lock.setOrderId(orderId);
        lock.setOrderNo(orderNo);
        lock.setMaterialId(materialId);
        lock.setMaterialName(material.getMaterialName());
        lock.setBatchCode(material.getBatchCode());
        lock.setLockQuantity(lockQuantity);
        lock.setUnitPrice(material.getUnitPrice());
        lock.setTotalAmount(material.getUnitPrice() != null ? material.getUnitPrice().multiply(lockQuantity) : null);
        lock.setLockStatus("LOCKED");
        lock.setLockTime(LocalDateTime.now());
        lock.setRemark(remark);
        lock.setCreateTime(LocalDateTime.now());
        save(lock);

        clearStockLockCache(materialId);
        log.info("工单{}锁定原料{}，数量：{}", orderNo, material.getMaterialName(), lockQuantity);
    }

    @Transactional(rollbackFor = Exception.class)
    public void batchLockStock(Long orderId, String orderNo, Map<Long, BigDecimal> materialQuantities, String remark) {
        for (Map.Entry<Long, BigDecimal> entry : materialQuantities.entrySet()) {
            lockStock(orderId, orderNo, entry.getKey(), entry.getValue(), remark);
        }
    }

    @Transactional(rollbackFor = Exception.class)
    public void releaseStockByOrderId(Long orderId) {
        LambdaQueryWrapper<MaterialStockLock> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(MaterialStockLock::getOrderId, orderId)
                .eq(MaterialStockLock::getLockStatus, "LOCKED");

        List<MaterialStockLock> locks = list(wrapper);
        for (MaterialStockLock lock : locks) {
            lock.setLockStatus("RELEASED");
            lock.setReleaseTime(LocalDateTime.now());
            updateById(lock);
            clearStockLockCache(lock.getMaterialId());
        }

        log.info("释放工单{}的库存锁定，共{}条", orderId, locks.size());
    }

    @Transactional(rollbackFor = Exception.class)
    public void confirmStockUsage(Long orderId) {
        LambdaQueryWrapper<MaterialStockLock> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(MaterialStockLock::getOrderId, orderId)
                .eq(MaterialStockLock::getLockStatus, "LOCKED");

        List<MaterialStockLock> locks = list(wrapper);
        for (MaterialStockLock lock : locks) {
            materialService.updateStock(lock.getMaterialId(), lock.getLockQuantity().negate());
            lock.setLockStatus("USED");
            lock.setReleaseTime(LocalDateTime.now());
            updateById(lock);
            clearStockLockCache(lock.getMaterialId());
        }

        log.info("确认工单{}的库存使用，共{}条", orderId, locks.size());
    }

    @SuppressWarnings("unchecked")
    public BigDecimal getLockedQuantityByMaterialId(Long materialId) {
        String cacheKey = STOCK_LOCK_KEY + materialId;
        Object cached = redisTemplate.opsForValue().get(cacheKey);
        if (cached != null) {
            return new BigDecimal(cached.toString());
        }

        LambdaQueryWrapper<MaterialStockLock> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(MaterialStockLock::getMaterialId, materialId)
                .eq(MaterialStockLock::getLockStatus, "LOCKED");

        List<MaterialStockLock> locks = list(wrapper);
        BigDecimal totalLocked = locks.stream()
                .map(MaterialStockLock::getLockQuantity)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        redisTemplate.opsForValue().set(cacheKey, totalLocked.toString());
        return totalLocked;
    }

    public List<MaterialStockLock> getLocksByOrderId(Long orderId) {
        LambdaQueryWrapper<MaterialStockLock> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(MaterialStockLock::getOrderId, orderId)
                .orderByDesc(MaterialStockLock::getCreateTime);
        return list(wrapper);
    }

    private void clearStockLockCache(Long materialId) {
        redisTemplate.delete(STOCK_LOCK_KEY + materialId);
    }
}
