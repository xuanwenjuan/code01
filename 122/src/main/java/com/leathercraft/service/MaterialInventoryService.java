package com.leathercraft.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.leathercraft.dto.MaterialInventoryDTO;
import com.leathercraft.dto.MaterialInventoryQueryDTO;
import com.leathercraft.entity.MaterialInventory;
import com.leathercraft.enums.MaterialStatusEnum;
import com.leathercraft.enums.MaterialTypeEnum;
import com.leathercraft.exception.BusinessException;
import com.leathercraft.mapper.MaterialInventoryMapper;
import com.leathercraft.vo.MaterialInventoryVO;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Random;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MaterialInventoryService {

    private final MaterialInventoryMapper materialInventoryMapper;
    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;

    private static final String MATERIAL_CACHE_PREFIX = "material:";
    private static final String MATERIAL_LIST_CACHE_KEY = "material:list";

    private String generateBatchNo(String materialType) {
        String dateStr = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String randomStr = String.format("%04d", new Random().nextInt(10000));
        return materialType + "-" + dateStr + "-" + randomStr;
    }

    private void updateMaterialStatus(MaterialInventory inventory) {
        if (inventory.getQuantity() == null) {
            inventory.setQuantity(BigDecimal.ZERO);
        }
        if (inventory.getLockedQuantity() == null) {
            inventory.setLockedQuantity(BigDecimal.ZERO);
        }
        inventory.setAvailableQuantity(inventory.getQuantity().subtract(inventory.getLockedQuantity()));

        if (inventory.getWarningQuantity() != null &&
                inventory.getAvailableQuantity().compareTo(inventory.getWarningQuantity()) <= 0) {
            inventory.setStatus(MaterialStatusEnum.WARNING.getCode());
        } else if (inventory.getLockedQuantity().compareTo(BigDecimal.ZERO) > 0) {
            inventory.setStatus(MaterialStatusEnum.LOCKED.getCode());
        } else {
            inventory.setStatus(MaterialStatusEnum.SUFFICIENT.getCode());
        }
    }

    private MaterialInventoryVO convertToVO(MaterialInventory inventory) {
        MaterialInventoryVO vo = new MaterialInventoryVO();
        BeanUtils.copyProperties(inventory, vo);
        vo.setMaterialTypeName(MaterialTypeEnum.getDescByCode(inventory.getMaterialType()));
        vo.setStatusName(MaterialStatusEnum.getDescByCode(inventory.getStatus()));
        if (inventory.getExpireDate() != null) {
            long days = ChronoUnit.DAYS.between(LocalDate.now(), inventory.getExpireDate());
            vo.setExpireDays((int) days);
        }
        return vo;
    }

    @Transactional(rollbackFor = Exception.class)
    public void add(MaterialInventoryDTO dto) {
        MaterialInventory inventory = new MaterialInventory();
        BeanUtils.copyProperties(dto, inventory);
        inventory.setBatchNo(generateBatchNo(dto.getMaterialType()));
        inventory.setLockedQuantity(BigDecimal.ZERO);

        if (dto.getUnitPrice() != null && dto.getQuantity() != null) {
            inventory.setTotalPrice(dto.getUnitPrice().multiply(dto.getQuantity()));
        }

        updateMaterialStatus(inventory);
        materialInventoryMapper.insert(inventory);
        clearMaterialCache();
    }

    @Transactional(rollbackFor = Exception.class)
    public void update(MaterialInventory inventory) {
        if (inventory.getUnitPrice() != null && inventory.getQuantity() != null) {
            inventory.setTotalPrice(inventory.getUnitPrice().multiply(inventory.getQuantity()));
        }
        updateMaterialStatus(inventory);
        materialInventoryMapper.updateById(inventory);
        clearMaterialCache();
    }

    @Transactional(rollbackFor = Exception.class)
    public void lockStock(Long materialId, BigDecimal quantity, Long orderId) {
        MaterialInventory inventory = materialInventoryMapper.selectById(materialId);
        if (inventory == null) {
            throw new BusinessException("物料不存在");
        }

        BigDecimal availableQty = inventory.getQuantity().subtract(inventory.getLockedQuantity());
        if (availableQty.compareTo(quantity) < 0) {
            throw new BusinessException("可用库存不足，当前可用：" + availableQty + inventory.getUnit());
        }

        materialInventoryMapper.update(
                new LambdaUpdateWrapper<MaterialInventory>()
                        .eq(MaterialInventory::getId, materialId)
                        .setSql("locked_quantity = locked_quantity + " + quantity)
        );

        String lockKey = "material:lock:" + materialId + ":" + orderId;
        redisTemplate.opsForValue().set(lockKey, quantity.toString(), 24, TimeUnit.HOURS);

        MaterialInventory updated = materialInventoryMapper.selectById(materialId);
        updateMaterialStatus(updated);
        materialInventoryMapper.updateById(updated);
        clearMaterialCache();
    }

    @Transactional(rollbackFor = Exception.class)
    public void unlockStock(Long materialId, BigDecimal quantity, Long orderId) {
        materialInventoryMapper.update(
                new LambdaUpdateWrapper<MaterialInventory>()
                        .eq(MaterialInventory::getId, materialId)
                        .setSql("locked_quantity = GREATEST(0, locked_quantity - " + quantity + ")")
        );

        String lockKey = "material:lock:" + materialId + ":" + orderId;
        redisTemplate.delete(lockKey);

        MaterialInventory updated = materialInventoryMapper.selectById(materialId);
        updateMaterialStatus(updated);
        materialInventoryMapper.updateById(updated);
        clearMaterialCache();
    }

    @Transactional(rollbackFor = Exception.class)
    public void deductStock(Long materialId, BigDecimal quantity, Long orderId) {
        MaterialInventory inventory = materialInventoryMapper.selectById(materialId);
        if (inventory == null) {
            throw new BusinessException("物料不存在");
        }

        if (inventory.getLockedQuantity().compareTo(quantity) < 0) {
            throw new BusinessException("锁定库存不足");
        }

        materialInventoryMapper.update(
                new LambdaUpdateWrapper<MaterialInventory>()
                        .eq(MaterialInventory::getId, materialId)
                        .setSql("quantity = quantity - " + quantity)
                        .setSql("locked_quantity = locked_quantity - " + quantity)
        );

        String lockKey = "material:lock:" + materialId + ":" + orderId;
        redisTemplate.delete(lockKey);

        MaterialInventory updated = materialInventoryMapper.selectById(materialId);
        updateMaterialStatus(updated);
        materialInventoryMapper.updateById(updated);
        clearMaterialCache();
    }

    @Transactional(rollbackFor = Exception.class)
    public void stopPurchase(Long id) {
        materialInventoryMapper.update(
                new LambdaUpdateWrapper<MaterialInventory>()
                        .eq(MaterialInventory::getId, id)
                        .set(MaterialInventory::getStatus, MaterialStatusEnum.STOPPED.getCode())
        );
        clearMaterialCache();
    }

    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        materialInventoryMapper.deleteById(id);
        clearMaterialCache();
    }

    public List<MaterialInventoryVO> list(MaterialInventoryQueryDTO query) {
        LambdaQueryWrapper<MaterialInventory> wrapper = new LambdaQueryWrapper<>();

        if (query.getMaterialName() != null && !query.getMaterialName().isEmpty()) {
            wrapper.like(MaterialInventory::getMaterialName, query.getMaterialName());
        }
        if (query.getMaterialType() != null && !query.getMaterialType().isEmpty()) {
            wrapper.eq(MaterialInventory::getMaterialType, query.getMaterialType());
        }
        if (query.getStatus() != null && !query.getStatus().isEmpty()) {
            wrapper.eq(MaterialInventory::getStatus, query.getStatus());
        }
        if (query.getOrigin() != null && !query.getOrigin().isEmpty()) {
            wrapper.like(MaterialInventory::getOrigin, query.getOrigin());
        }
        if (query.getBatchNo() != null && !query.getBatchNo().isEmpty()) {
            wrapper.like(MaterialInventory::getBatchNo, query.getBatchNo());
        }
        if (query.getExpireStartDate() != null) {
            wrapper.ge(MaterialInventory::getExpireDate, query.getExpireStartDate());
        }
        if (query.getExpireEndDate() != null) {
            wrapper.le(MaterialInventory::getExpireDate, query.getExpireEndDate());
        }

        wrapper.orderByDesc(MaterialInventory::getCreateTime);
        List<MaterialInventory> list = materialInventoryMapper.selectList(wrapper);
        return list.stream().map(this::convertToVO).collect(Collectors.toList());
    }

    public MaterialInventoryVO getById(Long id) {
        String cacheKey = MATERIAL_CACHE_PREFIX + id;
        try {
            String cacheData = redisTemplate.opsForValue().get(cacheKey);
            if (cacheData != null) {
                return objectMapper.readValue(cacheData, MaterialInventoryVO.class);
            }
        } catch (Exception e) {
        }

        MaterialInventory inventory = materialInventoryMapper.selectById(id);
        if (inventory == null) {
            return null;
        }

        MaterialInventoryVO vo = convertToVO(inventory);
        try {
            redisTemplate.opsForValue().set(cacheKey, objectMapper.writeValueAsString(vo), 30, TimeUnit.MINUTES);
        } catch (Exception e) {
        }

        return vo;
    }

    public List<MaterialInventoryVO> getExpiringSoon() {
        LocalDate today = LocalDate.now();
        LocalDate warningDate = today.plusDays(7);
        List<MaterialInventory> list = materialInventoryMapper.selectList(
                new LambdaQueryWrapper<MaterialInventory>()
                        .le(MaterialInventory::getExpireDate, warningDate)
                        .ge(MaterialInventory::getExpireDate, today)
                        .ne(MaterialInventory::getStatus, MaterialStatusEnum.STOPPED.getCode())
        );
        return list.stream().map(this::convertToVO).collect(Collectors.toList());
    }

    private void clearMaterialCache() {
        redisTemplate.delete(redisTemplate.keys(MATERIAL_CACHE_PREFIX + "*"));
        redisTemplate.delete(MATERIAL_LIST_CACHE_KEY);
    }
}
