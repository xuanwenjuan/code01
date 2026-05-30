package com.bearing.production.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.bearing.production.dto.MaterialDTO;
import com.bearing.production.dto.MaterialQueryDTO;
import com.bearing.production.entity.Material;
import com.bearing.production.exception.BusinessException;
import com.bearing.production.mapper.MaterialMapper;
import com.bearing.production.util.RedisUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class MaterialService {

    private final MaterialMapper materialMapper;
    private final RedisUtil redisUtil;

    private static final String MATERIAL_KEY = "bearing:material:";
    private static final String MATERIAL_LOCK_KEY = "bearing:material:lock:";

    @Transactional(rollbackFor = Exception.class)
    @CacheEvict(value = "materialCache", allEntries = true)
    public void addMaterial(MaterialDTO dto) {
        Material material = convertToEntity(dto);
        String batchNo = generateBatchNo(material.getMaterialType());
        material.setBatchNo(batchNo);
        material.setStockStatus(calculateStockStatus(material.getStockQuantity(), material.getWarningQuantity()));

        if (material.getRustProof() == null) {
            material.setRustProof(0);
        }

        if (material.getRustProof() == 1 && material.getRustProofDays() != null) {
            material.setInWarehouseTime(LocalDateTime.now());
            material.setNextRustProofTime(LocalDateTime.now().plusDays(material.getRustProofDays()));
        }

        materialMapper.insert(material);
        log.info("【原料入库】批次号: {}, 名称: {}, 数量: {}", batchNo, material.getMaterialName(), material.getStockQuantity());
    }

    @Transactional(rollbackFor = Exception.class)
    @CacheEvict(value = "materialCache", allEntries = true)
    public void updateMaterial(Long id, MaterialDTO dto) {
        Material exist = getMaterial(id);
        
        if (dto.getMaterialName() != null) exist.setMaterialName(dto.getMaterialName());
        if (dto.getSpecification() != null) exist.setSpecification(dto.getSpecification());
        if (dto.getMaterialType() != null) exist.setMaterialType(dto.getMaterialType());
        if (dto.getSupplier() != null) exist.setSupplier(dto.getSupplier());
        if (dto.getUnitPrice() != null) exist.setUnitPrice(dto.getUnitPrice());
        if (dto.getStockQuantity() != null) exist.setStockQuantity(dto.getStockQuantity());
        if (dto.getUnit() != null) exist.setUnit(dto.getUnit());
        if (dto.getWarningQuantity() != null) exist.setWarningQuantity(dto.getWarningQuantity());
        if (dto.getRustProof() != null) exist.setRustProof(dto.getRustProof());
        if (dto.getRustProofDays() != null) exist.setRustProofDays(dto.getRustProofDays());
        if (dto.getRemark() != null) exist.setRemark(dto.getRemark());

        if (exist.getStockQuantity() != null && exist.getWarningQuantity() != null) {
            exist.setStockStatus(calculateStockStatus(exist.getStockQuantity(), exist.getWarningQuantity()));
        }

        materialMapper.updateById(exist);
        clearMaterialCache(id);
        log.info("【原料更新】ID: {}", id);
    }

    @Transactional(rollbackFor = Exception.class)
    @CacheEvict(value = "materialCache", allEntries = true)
    public void deleteMaterial(Long id) {
        materialMapper.deleteById(id);
        clearMaterialCache(id);
        log.info("【原料删除】ID: {}", id);
    }

    @Transactional(rollbackFor = Exception.class)
    @CacheEvict(value = "materialCache", allEntries = true)
    public void updateStock(Long id, BigDecimal quantity) {
        Material material = getMaterial(id);

        BigDecimal newStock = material.getStockQuantity().add(quantity);
        if (newStock.compareTo(BigDecimal.ZERO) < 0) {
            throw new BusinessException("库存不足");
        }

        material.setStockQuantity(newStock);
        material.setStockStatus(calculateStockStatus(newStock, material.getWarningQuantity()));
        materialMapper.updateById(material);
        clearMaterialCache(id);
        
        log.info("【库存更新】ID: {}, 变更: {}, 现库存: {}", id, quantity, newStock);
    }

    @Transactional(rollbackFor = Exception.class)
    @CacheEvict(value = "materialCache", allEntries = true)
    public boolean lockMaterialStock(Long materialId, BigDecimal quantity, Long workOrderId) {
        String lockKey = MATERIAL_LOCK_KEY + materialId;
        
        if (redisUtil.hasKey(lockKey)) {
            throw new BusinessException("原料正在被其他工单锁定，请稍后重试");
        }

        Material material = getMaterial(materialId);
        if (material.getStockQuantity().compareTo(quantity) < 0) {
            throw new BusinessException("原料库存不足，当前库存: " + material.getStockQuantity());
        }

        BigDecimal lockedQuantity = material.getLockedQuantity() != null ? material.getLockedQuantity() : BigDecimal.ZERO;
        BigDecimal availableQuantity = material.getStockQuantity().subtract(lockedQuantity);
        
        if (availableQuantity.compareTo(quantity) < 0) {
            throw new BusinessException("可用库存不足，已锁定: " + lockedQuantity + ", 可用: " + availableQuantity);
        }

        material.setLockedQuantity(lockedQuantity.add(quantity));
        materialMapper.updateById(material);

        redisUtil.set(lockKey, workOrderId, 30, TimeUnit.MINUTES);
        clearMaterialCache(materialId);

        log.info("【库存锁定】工单ID: {}, 原料ID: {}, 锁定数量: {}", workOrderId, materialId, quantity);
        return true;
    }

    @Transactional(rollbackFor = Exception.class)
    @CacheEvict(value = "materialCache", allEntries = true)
    public void unlockMaterialStock(Long materialId, BigDecimal quantity, Long workOrderId) {
        Material material = getMaterial(materialId);
        
        BigDecimal lockedQuantity = material.getLockedQuantity() != null ? material.getLockedQuantity() : BigDecimal.ZERO;
        if (lockedQuantity.compareTo(quantity) < 0) {
            quantity = lockedQuantity;
        }

        material.setLockedQuantity(lockedQuantity.subtract(quantity));
        materialMapper.updateById(material);

        redisUtil.delete(MATERIAL_LOCK_KEY + materialId);
        clearMaterialCache(materialId);

        log.info("【库存解锁】工单ID: {}, 原料ID: {}, 解锁数量: {}", workOrderId, materialId, quantity);
    }

    @Transactional(rollbackFor = Exception.class)
    @CacheEvict(value = "materialCache", allEntries = true)
    public void consumeMaterialStock(Long materialId, BigDecimal quantity, Long workOrderId) {
        Material material = getMaterial(materialId);
        
        BigDecimal lockedQuantity = material.getLockedQuantity() != null ? material.getLockedQuantity() : BigDecimal.ZERO;
        if (lockedQuantity.compareTo(quantity) < 0) {
            throw new BusinessException("锁定库存不足，无法扣减");
        }

        material.setStockQuantity(material.getStockQuantity().subtract(quantity));
        material.setLockedQuantity(lockedQuantity.subtract(quantity));
        material.setStockStatus(calculateStockStatus(material.getStockQuantity(), material.getWarningQuantity()));
        
        materialMapper.updateById(material);
        redisUtil.delete(MATERIAL_LOCK_KEY + materialId);
        clearMaterialCache(materialId);

        log.info("【库存扣减】工单ID: {}, 原料ID: {}, 扣减数量: {}", workOrderId, materialId, quantity);
    }

    public Material getById(Long id) {
        String cacheKey = MATERIAL_KEY + id;
        
        if (redisUtil.hasKey(cacheKey)) {
            return (Material) redisUtil.get(cacheKey);
        }
        
        Material material = getMaterial(id);
        redisUtil.set(cacheKey, material, 30, TimeUnit.MINUTES);
        return material;
    }

    @Cacheable(value = "materialCache", key = "'query:' + #queryDTO.hashCode()")
    public IPage<Material> queryByConditions(MaterialQueryDTO queryDTO) {
        LambdaQueryWrapper<Material> wrapper = new LambdaQueryWrapper<>();
        
        if (StringUtils.hasText(queryDTO.getMaterialName())) {
            wrapper.like(Material::getMaterialName, queryDTO.getMaterialName());
        }
        if (StringUtils.hasText(queryDTO.getSpecification())) {
            wrapper.like(Material::getSpecification, queryDTO.getSpecification());
        }
        if (StringUtils.hasText(queryDTO.getMaterialType())) {
            wrapper.like(Material::getMaterialType, queryDTO.getMaterialType());
        }
        if (StringUtils.hasText(queryDTO.getSupplier())) {
            wrapper.like(Material::getSupplier, queryDTO.getSupplier());
        }
        if (queryDTO.getStockStatus() != null) {
            wrapper.eq(Material::getStockStatus, queryDTO.getStockStatus());
        }
        if (queryDTO.getRustProof() != null) {
            wrapper.eq(Material::getRustProof, queryDTO.getRustProof());
        }
        
        wrapper.orderByDesc(Material::getCreateTime);
        
        Page<Material> page = new Page<>(queryDTO.getPageNum(), queryDTO.getPageSize());
        return materialMapper.selectPage(page, wrapper);
    }

    @Cacheable(value = "materialCache", key = "'list:' + #stockStatus + ':' + #page + ':' + #size")
    public IPage<Material> getByStockStatusPage(Integer stockStatus, int page, int size) {
        LambdaQueryWrapper<Material> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(stockStatus != null, Material::getStockStatus, stockStatus);
        wrapper.orderByDesc(Material::getCreateTime);
        return materialMapper.selectPage(new Page<>(page, size), wrapper);
    }

    public List<Material> getByStockStatus(Integer stockStatus) {
        LambdaQueryWrapper<Material> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(stockStatus != null, Material::getStockStatus, stockStatus);
        wrapper.orderByDesc(Material::getCreateTime);
        return materialMapper.selectList(wrapper);
    }

    public List<Material> getRustProofReminderList() {
        LambdaQueryWrapper<Material> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Material::getRustProof, 1)
                .le(Material::getNextRustProofTime, LocalDateTime.now().plusDays(7));
        return materialMapper.selectList(wrapper);
    }

    @Transactional(rollbackFor = Exception.class)
    public void doRustProof(Long id) {
        Material material = getMaterial(id);
        material.setNextRustProofTime(LocalDateTime.now().plusDays(material.getRustProofDays()));
        materialMapper.updateById(material);
        clearMaterialCache(id);
        log.info("【防锈处理】ID: {}, 下次防锈时间: {}", id, material.getNextRustProofTime());
    }

    private Material getMaterial(Long id) {
        Material material = materialMapper.selectById(id);
        if (material == null) {
            throw new BusinessException("原料不存在，ID: " + id);
        }
        return material;
    }

    private Integer calculateStockStatus(BigDecimal stock, BigDecimal warning) {
        if (stock.compareTo(BigDecimal.ZERO) == 0) {
            return 2;
        }
        if (warning != null && stock.compareTo(warning) <= 0) {
            return 1;
        }
        return 0;
    }

    private String generateBatchNo(String materialType) {
        String prefix = "MAT";
        if (materialType != null) {
            prefix = materialType.substring(0, Math.min(3, materialType.length())).toUpperCase();
        }

        String dateStr = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));

        LambdaQueryWrapper<Material> wrapper = new LambdaQueryWrapper<>();
        wrapper.likeRight(Material::getBatchNo, prefix + dateStr);
        Long count = materialMapper.selectCount(wrapper);

        return prefix + dateStr + String.format("%04d", count + 1);
    }

    private Material convertToEntity(MaterialDTO dto) {
        Material material = new Material();
        material.setMaterialName(dto.getMaterialName());
        material.setSpecification(dto.getSpecification());
        material.setMaterialType(dto.getMaterialType());
        material.setSupplier(dto.getSupplier());
        material.setUnitPrice(dto.getUnitPrice());
        material.setStockQuantity(dto.getStockQuantity());
        material.setUnit(dto.getUnit());
        material.setWarningQuantity(dto.getWarningQuantity());
        material.setRustProof(dto.getRustProof());
        material.setRustProofDays(dto.getRustProofDays());
        material.setRemark(dto.getRemark());
        return material;
    }

    private void clearMaterialCache(Long id) {
        redisUtil.delete(MATERIAL_KEY + id);
        redisUtil.deleteByPrefix("materialCache:");
    }
}
