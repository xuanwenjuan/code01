package com.naturaldye.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.naturaldye.annotation.OperationLog;
import com.naturaldye.common.BusinessException;
import com.naturaldye.dto.InventoryQueryDTO;
import com.naturaldye.entity.Inventory;
import com.naturaldye.enums.InventoryStatusEnum;
import com.naturaldye.mapper.InventoryMapper;
import com.naturaldye.util.RedisUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class InventoryService {

    private final InventoryMapper inventoryMapper;
    private final RedisUtil redisUtil;

    private static final String INVENTORY_LOCK_KEY = "inventory:lock:";
    private static final String INVENTORY_CACHE_KEY = "inventory:";

    @Transactional(rollbackFor = Exception.class)
    @OperationLog(module = "库存管理", operation = "新增库存", description = "新增库存物料")
    public void addInventory(Inventory inventory) {
        String batchNo = generateBatchNo();
        inventory.setBatchNo(batchNo);
        updateInventoryStatus(inventory);
        inventoryMapper.insert(inventory);
        clearInventoryCache(inventory.getId());
    }

    @Transactional(rollbackFor = Exception.class)
    @OperationLog(module = "库存管理", operation = "更新库存", description = "更新库存物料信息")
    public void updateInventory(Inventory inventory) {
        Inventory exist = inventoryMapper.selectById(inventory.getId());
        if (exist == null) {
            throw new BusinessException("库存记录不存在");
        }
        updateInventoryStatus(inventory);
        inventoryMapper.updateById(inventory);
        clearInventoryCache(inventory.getId());
    }

    @Transactional(rollbackFor = Exception.class)
    @OperationLog(module = "库存管理", operation = "删除库存", description = "删除库存物料")
    public void deleteInventory(Long id) {
        inventoryMapper.deleteById(id);
        clearInventoryCache(id);
    }

    public Page<Inventory> queryInventoryPage(InventoryQueryDTO queryDTO) {
        Page<Inventory> page = new Page<>(queryDTO.getPageNum(), queryDTO.getPageSize());
        LambdaQueryWrapper<Inventory> queryWrapper = buildQueryWrapper(queryDTO);
        queryWrapper.orderByDesc(Inventory::getCreateTime);
        return inventoryMapper.selectPage(page, queryWrapper);
    }

    public List<Inventory> queryInventoryList(InventoryQueryDTO queryDTO) {
        LambdaQueryWrapper<Inventory> queryWrapper = buildQueryWrapper(queryDTO);
        queryWrapper.orderByDesc(Inventory::getCreateTime);
        return inventoryMapper.selectList(queryWrapper);
    }

    private LambdaQueryWrapper<Inventory> buildQueryWrapper(InventoryQueryDTO queryDTO) {
        LambdaQueryWrapper<Inventory> queryWrapper = new LambdaQueryWrapper<>();

        if (StringUtils.hasText(queryDTO.getMaterialName())) {
            queryWrapper.like(Inventory::getMaterialName, queryDTO.getMaterialName());
        }

        if (queryDTO.getMaterialType() != null) {
            queryWrapper.eq(Inventory::getMaterialType, queryDTO.getMaterialType());
        }

        if (queryDTO.getStatus() != null) {
            queryWrapper.eq(Inventory::getStatus, queryDTO.getStatus());
        }

        if (StringUtils.hasText(queryDTO.getOrigin())) {
            queryWrapper.like(Inventory::getOrigin, queryDTO.getOrigin());
        }

        if (queryDTO.getMinWeight() != null) {
            queryWrapper.ge(Inventory::getWeight, queryDTO.getMinWeight());
        }

        if (queryDTO.getMaxWeight() != null) {
            queryWrapper.le(Inventory::getWeight, queryDTO.getMaxWeight());
        }

        if (queryDTO.getMinQuantity() != null) {
            queryWrapper.ge(Inventory::getQuantity, queryDTO.getMinQuantity());
        }

        if (queryDTO.getMaxQuantity() != null) {
            queryWrapper.le(Inventory::getQuantity, queryDTO.getMaxQuantity());
        }

        if (queryDTO.getIsFading() != null) {
            queryWrapper.eq(Inventory::getIsFading, queryDTO.getIsFading());
        }

        return queryWrapper;
    }

    public Inventory getInventoryById(Long id) {
        String cacheKey = INVENTORY_CACHE_KEY + id;
        try {
            Object cacheData = redisUtil.get(cacheKey);
            if (cacheData != null) {
                return (Inventory) cacheData;
            }
        } catch (Exception e) {
            log.warn("获取库存缓存失败: {}", e.getMessage());
        }

        Inventory inventory = inventoryMapper.selectById(id);
        if (inventory != null) {
            try {
                redisUtil.set(cacheKey, inventory, 30, TimeUnit.MINUTES);
            } catch (Exception e) {
                log.warn("库存缓存写入失败: {}", e.getMessage());
            }
        }
        return inventory;
    }

    public List<Inventory> getExpiringFadingMaterials() {
        LocalDate today = LocalDate.now();
        LocalDate warningDate = today.plusDays(7);

        LambdaQueryWrapper<Inventory> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(Inventory::getIsFading, true)
                .le(Inventory::getExpiryDate, warningDate)
                .ge(Inventory::getExpiryDate, today)
                .orderByAsc(Inventory::getExpiryDate);
        return inventoryMapper.selectList(queryWrapper);
    }

    @Transactional(rollbackFor = Exception.class)
    public boolean lockInventory(Long inventoryId, BigDecimal quantity, Long workOrderId) {
        String lockKey = INVENTORY_LOCK_KEY + inventoryId;
        try {
            Boolean locked = redisUtil.setIfAbsent(lockKey, workOrderId.toString(), 5, TimeUnit.MINUTES);
            if (locked == null || !locked) {
                throw new BusinessException("库存正在处理中，请稍后再试");
            }

            Inventory inventory = inventoryMapper.selectById(inventoryId);
            if (inventory == null) {
                throw new BusinessException("库存物料不存在");
            }

            if (inventory.getStatus() != InventoryStatusEnum.SUFFICIENT.getCode()
                    && inventory.getStatus() != InventoryStatusEnum.WARNING.getCode()) {
                throw new BusinessException("库存状态异常，无法锁定");
            }

            if (inventory.getQuantity().compareTo(quantity) < 0) {
                throw new BusinessException("库存不足，可用: " + inventory.getQuantity()
                        + ", 需要: " + quantity);
            }

            inventory.setQuantity(inventory.getQuantity().subtract(quantity));
            if (inventory.getLockedQuantity() == null) {
                inventory.setLockedQuantity(BigDecimal.ZERO);
            }
            inventory.setLockedQuantity(inventory.getLockedQuantity().add(quantity));
            updateInventoryStatus(inventory);
            inventoryMapper.updateById(inventory);

            log.info("库存锁定成功，库存ID: {}, 工单ID: {}, 锁定数量: {}", inventoryId, workOrderId, quantity);
            return true;

        } finally {
            redisUtil.delete(INVENTORY_LOCK_KEY + inventoryId);
        }
    }

    @Transactional(rollbackFor = Exception.class)
    public boolean unlockInventory(Long inventoryId, BigDecimal quantity, Long workOrderId) {
        Inventory inventory = inventoryMapper.selectById(inventoryId);
        if (inventory == null) {
            log.warn("解锁库存失败，库存不存在: {}", inventoryId);
            return false;
        }

        if (inventory.getLockedQuantity() == null || inventory.getLockedQuantity().compareTo(quantity) < 0) {
            log.warn("解锁库存失败，锁定数量不足，库存ID: {}, 锁定数量: {}, 解锁数量: {}",
                    inventoryId, inventory.getLockedQuantity(), quantity);
            return false;
        }

        inventory.setQuantity(inventory.getQuantity().add(quantity));
        inventory.setLockedQuantity(inventory.getLockedQuantity().subtract(quantity));
        updateInventoryStatus(inventory);
        inventoryMapper.updateById(inventory);

        log.info("库存解锁成功，库存ID: {}, 工单ID: {}, 解锁数量: {}", inventoryId, workOrderId, quantity);
        return true;
    }

    @Transactional(rollbackFor = Exception.class)
    public boolean confirmDeduction(Long inventoryId, BigDecimal quantity, Long workOrderId) {
        Inventory inventory = inventoryMapper.selectById(inventoryId);
        if (inventory == null) {
            throw new BusinessException("库存物料不存在");
        }

        if (inventory.getLockedQuantity() == null || inventory.getLockedQuantity().compareTo(quantity) < 0) {
            throw new BusinessException("锁定数量不足，无法扣减");
        }

        inventory.setLockedQuantity(inventory.getLockedQuantity().subtract(quantity));
        inventoryMapper.updateById(inventory);

        log.info("库存扣减确认，库存ID: {}, 工单ID: {}, 扣减数量: {}", inventoryId, workOrderId, quantity);
        return true;
    }

    private void updateInventoryStatus(Inventory inventory) {
        if (inventory.getQuantity() == null) {
            inventory.setStatus(InventoryStatusEnum.SUFFICIENT.getCode());
            return;
        }

        BigDecimal quantity = inventory.getQuantity();
        BigDecimal warningQty = inventory.getWarningQuantity() != null
                ? inventory.getWarningQuantity() : BigDecimal.ZERO;

        if (quantity.compareTo(BigDecimal.ZERO) <= 0) {
            inventory.setStatus(InventoryStatusEnum.STOP_PURCHASE.getCode());
        } else if (quantity.compareTo(warningQty) <= 0) {
            inventory.setStatus(InventoryStatusEnum.WARNING.getCode());
        } else {
            inventory.setStatus(InventoryStatusEnum.SUFFICIENT.getCode());
        }
    }

    private String generateBatchNo() {
        String date = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String uuid = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        return "BATCH-" + date + "-" + uuid;
    }

    private void clearInventoryCache(Long id) {
        try {
            if (id != null) {
                redisUtil.delete(INVENTORY_CACHE_KEY + id);
            }
        } catch (Exception e) {
            log.warn("清除库存缓存失败: {}", e.getMessage());
        }
    }
}
