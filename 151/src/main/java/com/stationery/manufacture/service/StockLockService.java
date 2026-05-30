package com.stationery.manufacture.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.stationery.manufacture.common.BusinessException;
import com.stationery.manufacture.common.ErrorCode;
import com.stationery.manufacture.common.UserContext;
import com.stationery.manufacture.entity.MaterialStock;
import com.stationery.manufacture.entity.OrderMaterial;
import com.stationery.manufacture.entity.ProductionOrder;
import com.stationery.manufacture.entity.StockLock;
import com.stationery.manufacture.mapper.MaterialStockMapper;
import com.stationery.manufacture.mapper.OrderMaterialMapper;
import com.stationery.manufacture.mapper.ProductionOrderMapper;
import com.stationery.manufacture.mapper.StockLockMapper;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.concurrent.TimeUnit;

@Service
public class StockLockService {

    private final StockLockMapper stockLockMapper;
    private final MaterialStockMapper stockMapper;
    private final ProductionOrderMapper orderMapper;
    private final OrderMaterialMapper orderMaterialMapper;
    private final StringRedisTemplate redisTemplate;

    public StockLockService(StockLockMapper stockLockMapper,
                            MaterialStockMapper stockMapper,
                            ProductionOrderMapper orderMapper,
                            OrderMaterialMapper orderMaterialMapper,
                            StringRedisTemplate redisTemplate) {
        this.stockLockMapper = stockLockMapper;
        this.stockMapper = stockMapper;
        this.orderMapper = orderMapper;
        this.orderMaterialMapper = orderMaterialMapper;
        this.redisTemplate = redisTemplate;
    }

    @Transactional(rollbackFor = Exception.class)
    public void lockStockForOrder(Long orderId) {
        ProductionOrder order = orderMapper.selectById(orderId);
        if (order == null) {
            throw new BusinessException(ErrorCode.DATA_NOT_EXISTS);
        }
        if (order.getOrderStatus() < 1) {
            throw new BusinessException("请先排产再锁定库存");
        }

        List<OrderMaterial> materials = orderMaterialMapper.selectList(
                new LambdaQueryWrapper<OrderMaterial>().eq(OrderMaterial::getOrderId, orderId));

        if (materials.isEmpty()) {
            throw new BusinessException("工单未配置用料清单");
        }

        for (OrderMaterial material : materials) {
            lockMaterial(order, material);
        }

        orderMapper.update(null, new LambdaUpdateWrapper<ProductionOrder>()
                .eq(ProductionOrder::getId, orderId)
                .set(ProductionOrder::getOrderStatus, 1)
                .set(ProductionOrder::getUpdateTime, LocalDateTime.now()));
    }

    @Transactional(rollbackFor = Exception.class)
    public void lockMaterial(ProductionOrder order, OrderMaterial orderMaterial) {
        MaterialStock stock = stockMapper.selectById(orderMaterial.getMaterialId());
        if (stock == null) {
            throw new BusinessException("物料不存在：" + orderMaterial.getMaterialName());
        }

        BigDecimal lockedQuantity = stockLockMapper.sumLockedQuantity(stock.getId());
        BigDecimal availableQuantity = stock.getQuantity().subtract(lockedQuantity);

        if (availableQuantity.compareTo(orderMaterial.getPlannedQuantity()) < 0) {
            throw new BusinessException("物料库存不足：" + stock.getMaterialName() +
                    "，可用：" + availableQuantity + stock.getUnit() +
                    "，需要：" + orderMaterial.getPlannedQuantity() + stock.getUnit());
        }

        StockLock lock = new StockLock();
        lock.setLockNo(generateLockNo());
        lock.setOrderId(order.getId());
        lock.setOrderNo(order.getOrderNo());
        lock.setMaterialId(stock.getId());
        lock.setMaterialCode(stock.getMaterialCode());
        lock.setMaterialName(stock.getMaterialName());
        lock.setSpecification(stock.getSpecification());
        lock.setUnit(stock.getUnit());
        lock.setLockQuantity(orderMaterial.getPlannedQuantity());
        lock.setUnitPrice(stock.getUnitPrice());
        lock.setTotalPrice(orderMaterial.getPlannedQuantity().multiply(stock.getUnitPrice()));
        lock.setBatchNo(stock.getBatchNo());
        lock.setLockStatus(1);
        lock.setLockTime(LocalDateTime.now());
        lock.setOperatorId(UserContext.getCurrentUserId());
        lock.setOperatorName(UserContext.getCurrentUsername());
        lock.setCreateTime(LocalDateTime.now());
        lock.setUpdateTime(LocalDateTime.now());
        stockLockMapper.insert(lock);
    }

    @Transactional(rollbackFor = Exception.class)
    public void unlockStockForOrder(Long orderId, String reason) {
        List<StockLock> locks = stockLockMapper.selectList(new LambdaQueryWrapper<StockLock>()
                .eq(StockLock::getOrderId, orderId)
                .eq(StockLock::getLockStatus, 1));

        for (StockLock lock : locks) {
            unlockStock(lock.getId(), reason);
        }
    }

    @Transactional(rollbackFor = Exception.class)
    public void unlockStock(Long lockId, String reason) {
        StockLock lock = stockLockMapper.selectById(lockId);
        if (lock == null) {
            throw new BusinessException(ErrorCode.DATA_NOT_EXISTS);
        }
        if (lock.getLockStatus() != 1) {
            throw new BusinessException("库存锁定已失效");
        }

        stockLockMapper.update(null, new LambdaUpdateWrapper<StockLock>()
                .eq(StockLock::getId, lockId)
                .set(StockLock::getLockStatus, 0)
                .set(StockLock::getUnlockTime, LocalDateTime.now())
                .set(StockLock::getUnlockReason, reason)
                .set(StockLock::getUpdateTime, LocalDateTime.now()));
    }

    @Transactional(rollbackFor = Exception.class)
    public void confirmAndDeductStock(Long orderId) {
        List<StockLock> locks = stockLockMapper.selectList(new LambdaQueryWrapper<StockLock>()
                .eq(StockLock::getOrderId, orderId)
                .eq(StockLock::getLockStatus, 1));

        for (StockLock lock : locks) {
            MaterialStock stock = stockMapper.selectById(lock.getMaterialId());
            if (stock == null) {
                throw new BusinessException("物料不存在");
            }
            if (stock.getQuantity().compareTo(lock.getLockQuantity()) < 0) {
                throw new BusinessException("库存不足：" + stock.getMaterialName());
            }

            stock.setQuantity(stock.getQuantity().subtract(lock.getLockQuantity()));
            if (stock.getQuantity().compareTo(stock.getWarningQuantity()) <= 0) {
                stock.setStockStatus(2);
                stock.setPurchaseStatus(2);
            }
            stock.setUpdateTime(LocalDateTime.now());
            stockMapper.updateById(stock);

            unlockStock(lock.getId(), "生产领用，扣减库存");
        }
    }

    public BigDecimal getAvailableQuantity(Long materialId) {
        MaterialStock stock = stockMapper.selectById(materialId);
        if (stock == null) {
            return BigDecimal.ZERO;
        }
        BigDecimal locked = stockLockMapper.sumLockedQuantity(materialId);
        return stock.getQuantity().subtract(locked);
    }

    public Page<StockLock> getLockPage(Integer pageNum, Integer pageSize,
                                        Long orderId, Long materialId, Integer lockStatus) {
        Page<StockLock> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<StockLock> wrapper = new LambdaQueryWrapper<>();
        if (orderId != null) {
            wrapper.eq(StockLock::getOrderId, orderId);
        }
        if (materialId != null) {
            wrapper.eq(StockLock::getMaterialId, materialId);
        }
        if (lockStatus != null) {
            wrapper.eq(StockLock::getLockStatus, lockStatus);
        }
        wrapper.orderByDesc(StockLock::getCreateTime);
        return stockLockMapper.selectPage(page, wrapper);
    }

    public List<StockLock> getLocksByOrder(Long orderId) {
        return stockLockMapper.selectList(new LambdaQueryWrapper<StockLock>()
                .eq(StockLock::getOrderId, orderId)
                .orderByDesc(StockLock::getCreateTime));
    }

    private String generateLockNo() {
        String date = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String key = "lock:no:" + date;
        Long increment = redisTemplate.opsForValue().increment(key, 1);
        redisTemplate.expire(key, 1, TimeUnit.DAYS);
        return "LK" + date + String.format("%06d", increment);
    }

    @Transactional(rollbackFor = Exception.class)
    public void releaseExpiredLocks() {
        LocalDateTime threshold = LocalDateTime.now().minusHours(24);
        List<StockLock> expiredLocks = stockLockMapper.selectList(new LambdaQueryWrapper<StockLock>()
                .eq(StockLock::getLockStatus, 1)
                .lt(StockLock::getLockTime, threshold));

        for (StockLock lock : expiredLocks) {
            unlockStock(lock.getId(), "锁定超时自动释放");
        }
    }
}
