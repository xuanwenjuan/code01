package com.logistics.bigcargo.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.logistics.bigcargo.dto.*;
import com.logistics.bigcargo.entity.Inventory;
import com.logistics.bigcargo.enums.StockStatusEnum;
import com.logistics.bigcargo.exception.BusinessException;
import com.logistics.bigcargo.mapper.InventoryMapper;
import com.logistics.bigcargo.util.OperationLogUtil;
import com.logistics.bigcargo.vo.InventoryStatisticsVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.concurrent.TimeUnit;

@Service
public class InventoryService {

    @Autowired
    private InventoryMapper inventoryMapper;

    @Autowired
    private OperationLogUtil operationLogUtil;

    @Autowired
    private StringRedisTemplate stringRedisTemplate;

    private static final String INVENTORY_LOCK_KEY = "inventory:lock:";
    private static final String INVENTORY_CACHE_KEY = "inventory:cache:";

    @Transactional(rollbackFor = Exception.class)
    public void addInventory(InventoryDTO dto, Long operatorId, String operatorName) {
        String batchNo = generateBatchNo();

        Inventory inventory = new Inventory();
        inventory.setBatchNo(batchNo);
        inventory.setGoodsName(dto.getGoodsName());
        inventory.setCategoryId(dto.getCategoryId());
        inventory.setSpecification(dto.getSpecification());
        inventory.setWeight(dto.getWeight());
        inventory.setVolume(dto.getVolume());
        inventory.setBearingLevel(dto.getBearingLevel());
        inventory.setStorageZone(dto.getStorageZone());
        inventory.setProtectionMaterial(dto.getProtectionMaterial());
        inventory.setQuantity(dto.getQuantity());
        inventory.setStockStatus(StockStatusEnum.NORMAL.getCode());
        inventory.setFragileFlag(dto.getFragileFlag());
        inventory.setProtectionExpireTime(dto.getProtectionExpireTime());
        inventory.setRemark(dto.getRemark());

        inventoryMapper.insert(inventory);

        operationLogUtil.log("入库登记", batchNo, "INVENTORY",
                operatorId, operatorName, "货品入库登记：" + dto.getGoodsName() + "，数量：" + dto.getQuantity());
    }

    @Transactional(rollbackFor = Exception.class)
    public void stockInCheck(StockInCheckDTO dto, Long operatorId, String operatorName) {
        Inventory inventory = inventoryMapper.selectById(dto.getInventoryId());
        if (inventory == null) {
            throw new BusinessException("库存记录不存在");
        }

        if (dto.getActualQuantity() != null) {
            inventory.setQuantity(dto.getActualQuantity());
        }
        if (dto.getActualWeight() != null) {
            inventory.setWeight(dto.getActualWeight());
        }
        if (dto.getActualVolume() != null) {
            inventory.setVolume(dto.getActualVolume());
        }

        if (dto.getPassFlag()) {
            inventory.setStockStatus(StockStatusEnum.NORMAL.getCode());
        }

        inventoryMapper.updateById(inventory);

        String result = dto.getPassFlag() ? "通过" : "未通过";
        operationLogUtil.log("入库清点", inventory.getBatchNo(), "INVENTORY",
                operatorId, operatorName, "入库清点" + result + "：" + inventory.getGoodsName() +
                        (dto.getCheckRemark() != null ? "，备注：" + dto.getCheckRemark() : ""));
    }

    @Transactional(rollbackFor = Exception.class)
    public void storeInZone(StoreInZoneDTO dto, Long operatorId, String operatorName) {
        Inventory inventory = inventoryMapper.selectById(dto.getInventoryId());
        if (inventory == null) {
            throw new BusinessException("库存记录不存在");
        }

        inventory.setStorageZone(dto.getStorageZone());
        inventory.setStockStatus(StockStatusEnum.NORMAL.getCode());

        inventoryMapper.updateById(inventory);

        operationLogUtil.log("库区存放", inventory.getBatchNo(), "INVENTORY",
                operatorId, operatorName, "库区存放：" + inventory.getGoodsName() +
                        "，库区：" + dto.getStorageZone() + "，库位：" + dto.getLocationCode());
    }

    @Transactional(rollbackFor = Exception.class)
    public void stockTransfer(StockTransferDTO dto, Long operatorId, String operatorName) {
        Inventory inventory = inventoryMapper.selectById(dto.getInventoryId());
        if (inventory == null) {
            throw new BusinessException("库存记录不存在");
        }

        String oldZone = inventory.getStorageZone();
        inventory.setStorageZone(dto.getTargetZone());
        inventory.setStockStatus(StockStatusEnum.NORMAL.getCode());

        inventoryMapper.updateById(inventory);

        operationLogUtil.log("库存调拨", inventory.getBatchNo(), "INVENTORY",
                operatorId, operatorName, "库存调拨：" + inventory.getGoodsName() +
                        "，从库区[" + oldZone + "]调拨到[" + dto.getTargetZone() + "]" +
                        (dto.getTransferReason() != null ? "，原因：" + dto.getTransferReason() : ""));
    }

    @Transactional(rollbackFor = Exception.class)
    public void batchUpdateStockStatus(BatchStockStatusDTO dto, Long operatorId, String operatorName) {
        for (Long id : dto.getInventoryIds()) {
            Inventory inventory = inventoryMapper.selectById(id);
            if (inventory != null) {
                inventory.setStockStatus(dto.getTargetStatus());
                inventoryMapper.updateById(inventory);
            }
        }

        operationLogUtil.log("批量更新状态", "BATCH", "INVENTORY",
                operatorId, operatorName, "批量更新" + dto.getInventoryIds().size() +
                        "条库存状态为：" + StockStatusEnum.getDesc(dto.getTargetStatus()) +
                        (dto.getBatchRemark() != null ? "，备注：" + dto.getBatchRemark() : ""));
    }

    @Transactional(rollbackFor = Exception.class)
    public void updateInventory(InventoryDTO dto, Long operatorId, String operatorName) {
        Inventory inventory = inventoryMapper.selectById(dto.getId());
        if (inventory == null) {
            throw new BusinessException("库存记录不存在");
        }

        inventory.setGoodsName(dto.getGoodsName());
        inventory.setCategoryId(dto.getCategoryId());
        inventory.setSpecification(dto.getSpecification());
        inventory.setWeight(dto.getWeight());
        inventory.setVolume(dto.getVolume());
        inventory.setBearingLevel(dto.getBearingLevel());
        inventory.setStorageZone(dto.getStorageZone());
        inventory.setProtectionMaterial(dto.getProtectionMaterial());
        inventory.setQuantity(dto.getQuantity());
        inventory.setStockStatus(dto.getStockStatus());
        inventory.setFragileFlag(dto.getFragileFlag());
        inventory.setProtectionExpireTime(dto.getProtectionExpireTime());
        inventory.setRemark(dto.getRemark());

        inventoryMapper.updateById(inventory);

        operationLogUtil.log("更新库存", inventory.getBatchNo(), "INVENTORY",
                operatorId, operatorName, "更新库存信息：" + dto.getGoodsName());
    }

    @Transactional(rollbackFor = Exception.class)
    public void deleteInventory(Long id, Long operatorId, String operatorName) {
        Inventory inventory = inventoryMapper.selectById(id);
        if (inventory == null) {
            throw new BusinessException("库存记录不存在");
        }
        inventoryMapper.deleteById(id);

        operationLogUtil.log("删除库存", inventory.getBatchNo(), "INVENTORY",
                operatorId, operatorName, "删除库存记录：" + inventory.getGoodsName());
    }

    @Transactional(rollbackFor = Exception.class)
    public void updateStockStatus(Long id, Integer stockStatus, Long operatorId, String operatorName) {
        Inventory inventory = inventoryMapper.selectById(id);
        if (inventory == null) {
            throw new BusinessException("库存记录不存在");
        }
        inventory.setStockStatus(stockStatus);
        inventoryMapper.updateById(inventory);

        operationLogUtil.log("更新库存状态", inventory.getBatchNo(), "INVENTORY",
                operatorId, operatorName, "更新库存状态为：" + StockStatusEnum.getDesc(stockStatus));
    }

    public Inventory getInventoryById(Long id) {
        return inventoryMapper.selectById(id);
    }

    public Page<Inventory> getInventoryPage(Integer pageNum, Integer pageSize,
                                            Long categoryId, Integer stockStatus, String goodsName,
                                            String storageZone, Integer bearingLevel, Integer fragileFlag) {
        LambdaQueryWrapper<Inventory> wrapper = new LambdaQueryWrapper<>();
        if (categoryId != null) {
            wrapper.eq(Inventory::getCategoryId, categoryId);
        }
        if (stockStatus != null) {
            wrapper.eq(Inventory::getStockStatus, stockStatus);
        }
        if (goodsName != null && !goodsName.isEmpty()) {
            wrapper.like(Inventory::getGoodsName, goodsName);
        }
        if (storageZone != null && !storageZone.isEmpty()) {
            wrapper.eq(Inventory::getStorageZone, storageZone);
        }
        if (bearingLevel != null) {
            wrapper.eq(Inventory::getBearingLevel, bearingLevel);
        }
        if (fragileFlag != null) {
            wrapper.eq(Inventory::getFragileFlag, fragileFlag);
        }
        wrapper.orderByDesc(Inventory::getCreateTime);

        return inventoryMapper.selectPage(new Page<>(pageNum, pageSize), wrapper);
    }

    public List<Inventory> getExpiringInventories() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime sevenDaysLater = now.plusDays(7);

        return inventoryMapper.selectList(new LambdaQueryWrapper<Inventory>()
                .eq(Inventory::getFragileFlag, 1)
                .ge(Inventory::getProtectionExpireTime, now)
                .le(Inventory::getProtectionExpireTime, sevenDaysLater)
                .eq(Inventory::getStockStatus, StockStatusEnum.NORMAL.getCode())
                .orderByAsc(Inventory::getProtectionExpireTime));
    }

    public InventoryStatisticsVO getStatistics() {
        InventoryStatisticsVO vo = new InventoryStatisticsVO();

        vo.setTotalCount(inventoryMapper.selectCount(new LambdaQueryWrapper<>()));
        vo.setNormalCount(inventoryMapper.selectCount(new LambdaQueryWrapper<Inventory>()
                .eq(Inventory::getStockStatus, StockStatusEnum.NORMAL.getCode())));
        vo.setPendingSortCount(inventoryMapper.selectCount(new LambdaQueryWrapper<Inventory>()
                .eq(Inventory::getStockStatus, StockStatusEnum.PENDING_SORT.getCode())));
        vo.setNearExpireCount(inventoryMapper.selectCount(new LambdaQueryWrapper<Inventory>()
                .eq(Inventory::getStockStatus, StockStatusEnum.NEAR_EXPIRE.getCode())));

        List<Inventory> all = inventoryMapper.selectList(new LambdaQueryWrapper<>());
        BigDecimal totalWeight = all.stream()
                .map(inv -> inv.getWeight() != null ? inv.getWeight() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalVolume = all.stream()
                .map(inv -> inv.getVolume() != null ? inv.getVolume() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        vo.setTotalWeight(totalWeight);
        vo.setTotalVolume(totalVolume);
        vo.setFragileCount(inventoryMapper.selectCount(new LambdaQueryWrapper<Inventory>()
                .eq(Inventory::getFragileFlag, 1)));
        vo.setExpiringCount((long) getExpiringInventories().size());

        return vo;
    }

    public List<Inventory> getInventoriesByIds(List<Long> ids) {
        return inventoryMapper.selectBatchIds(ids);
    }

    public Page<Inventory> queryInventoryPage(InventoryQueryDTO dto) {
        LambdaQueryWrapper<Inventory> wrapper = new LambdaQueryWrapper<>();

        if (dto.getCategoryId() != null) {
            wrapper.eq(Inventory::getCategoryId, dto.getCategoryId());
        }
        if (dto.getCategoryIds() != null && !dto.getCategoryIds().isEmpty()) {
            wrapper.in(Inventory::getCategoryId, dto.getCategoryIds());
        }
        if (dto.getStockStatus() != null) {
            wrapper.eq(Inventory::getStockStatus, dto.getStockStatus());
        }
        if (dto.getStockStatuses() != null && !dto.getStockStatuses().isEmpty()) {
            wrapper.in(Inventory::getStockStatus, dto.getStockStatuses());
        }
        if (dto.getGoodsName() != null && !dto.getGoodsName().isEmpty()) {
            wrapper.like(Inventory::getGoodsName, dto.getGoodsName());
        }
        if (dto.getBatchNo() != null && !dto.getBatchNo().isEmpty()) {
            wrapper.like(Inventory::getBatchNo, dto.getBatchNo());
        }
        if (dto.getStorageZone() != null && !dto.getStorageZone().isEmpty()) {
            wrapper.eq(Inventory::getStorageZone, dto.getStorageZone());
        }
        if (dto.getBearingLevel() != null) {
            wrapper.eq(Inventory::getBearingLevel, dto.getBearingLevel());
        }
        if (dto.getFragileFlag() != null) {
            wrapper.eq(Inventory::getFragileFlag, dto.getFragileFlag());
        }
        if (dto.getMinWeight() != null) {
            wrapper.ge(Inventory::getWeight, dto.getMinWeight());
        }
        if (dto.getMaxWeight() != null) {
            wrapper.le(Inventory::getWeight, dto.getMaxWeight());
        }
        if (dto.getMinVolume() != null) {
            wrapper.ge(Inventory::getVolume, dto.getMinVolume());
        }
        if (dto.getMaxVolume() != null) {
            wrapper.le(Inventory::getVolume, dto.getMaxVolume());
        }
        if (dto.getStartTime() != null) {
            wrapper.ge(Inventory::getCreateTime, dto.getStartTime());
        }
        if (dto.getEndTime() != null) {
            wrapper.le(Inventory::getCreateTime, dto.getEndTime());
        }

        if ("asc".equalsIgnoreCase(dto.getSortOrder())) {
            wrapper.orderByAsc(getSortField(dto.getSortField()));
        } else {
            wrapper.orderByDesc(getSortField(dto.getSortField()));
        }

        return inventoryMapper.selectPage(new Page<>(dto.getPageNum(), dto.getPageSize()), wrapper);
    }

    @Transactional(rollbackFor = Exception.class)
    public boolean lockInventoryStock(Long inventoryId, int quantity, String lockSource) {
        String lockKey = INVENTORY_LOCK_KEY + inventoryId;
        Boolean locked = stringRedisTemplate.opsForValue().setIfAbsent(lockKey, String.valueOf(quantity), 30, TimeUnit.MINUTES);

        if (Boolean.TRUE.equals(locked)) {
            Inventory inventory = inventoryMapper.selectById(inventoryId);
            if (inventory == null || inventory.getQuantity() < quantity) {
                stringRedisTemplate.delete(lockKey);
                return false;
            }
            inventory.setQuantity(inventory.getQuantity() - quantity);
            inventoryMapper.updateById(inventory);

            operationLogUtil.log("锁定库存", inventory.getBatchNo(), "INVENTORY",
                    0L, "系统", "锁定库存数量：" + quantity + "，来源：" + lockSource);
            return true;
        }
        return false;
    }

    @Transactional(rollbackFor = Exception.class)
    public void unlockInventoryStock(Long inventoryId, int quantity) {
        String lockKey = INVENTORY_LOCK_KEY + inventoryId;
        stringRedisTemplate.delete(lockKey);

        Inventory inventory = inventoryMapper.selectById(inventoryId);
        if (inventory != null) {
            inventory.setQuantity(inventory.getQuantity() + quantity);
            inventoryMapper.updateById(inventory);

            operationLogUtil.log("释放库存", inventory.getBatchNo(), "INVENTORY",
                    0L, "系统", "释放库存数量：" + quantity);
        }
    }

    private String getSortField(String field) {
        return switch (field) {
            case "weight" -> "weight";
            case "volume" -> "volume";
            case "quantity" -> "quantity";
            case "updateTime" -> "updateTime";
            default -> "createTime";
        };
    }

    private String generateBatchNo() {
        String datePrefix = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        Long count = inventoryMapper.selectCount(new LambdaQueryWrapper<Inventory>()
                .like(Inventory::getBatchNo, "RK" + datePrefix));
        String sequence = String.format("%04d", count + 1);
        return "RK" + datePrefix + sequence;
    }
}
