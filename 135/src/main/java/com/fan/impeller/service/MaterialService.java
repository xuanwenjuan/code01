package com.fan.impeller.service;

import cn.hutool.core.date.DateUnit;
import cn.hutool.core.date.DateUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.fan.impeller.common.Constants;
import com.fan.impeller.common.PageQuery;
import com.fan.impeller.dto.MaterialQueryDTO;
import com.fan.impeller.entity.Material;
import com.fan.impeller.entity.MaterialLock;
import com.fan.impeller.exception.BusinessException;
import com.fan.impeller.mapper.MaterialLockMapper;
import com.fan.impeller.mapper.MaterialMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MaterialService extends ServiceImpl<MaterialMapper, Material> {

    private final MaterialLockMapper materialLockMapper;

    @Cacheable(value = "materialPage", key = "#query.pageNum + '-' + #query.pageSize + '-' + #dto.hashCode()", unless = "#result == null")
    public Page<Material> queryPage(PageQuery query, MaterialQueryDTO dto) {
        return lambdaQuery()
                .like(dto.getMaterialName() != null, Material::getMaterialName, dto.getMaterialName())
                .eq(dto.getMaterialType() != null, Material::getMaterialType, dto.getMaterialType())
                .like(dto.getBatchNo() != null, Material::getBatchNo, dto.getBatchNo())
                .eq(dto.getStockStatus() != null, Material::getStockStatus, dto.getStockStatus())
                .eq(dto.getStatus() != null, Material::getStatus, dto.getStatus())
                .ge(dto.getStartDate() != null, Material::getCreateTime, dto.getStartDate().atStartOfDay())
                .le(dto.getEndDate() != null, Material::getCreateTime, dto.getEndDate().atTime(23, 59, 59))
                .orderByDesc(Material::getCreateTime)
                .page(new Page<>(query.getPageNum(), query.getPageSize()));
    }

    public Page<Material> page(PageQuery query, String materialType, Integer stockStatus) {
        return lambdaQuery()
                .eq(materialType != null, Material::getMaterialType, materialType)
                .eq(stockStatus != null, Material::getStockStatus, stockStatus)
                .orderByDesc(Material::getCreateTime)
                .page(new Page<>(query.getPageNum(), query.getPageSize()));
    }

    @Transactional(rollbackFor = Exception.class)
    @CacheEvict(value = {"materialPage", "materialDetail"}, allEntries = true)
    public void addMaterial(Material material) {
        String batchNo = generateBatchNo(material.getMaterialType());
        material.setBatchNo(batchNo);

        if (material.getProductionDate() != null && material.getShelfLifeDays() != null) {
            material.setExpiryDate(material.getProductionDate().plusDays(material.getShelfLifeDays()));
        }

        if (material.getQuantity() != null && material.getUnitPrice() != null) {
            material.setTotalAmount(material.getQuantity().multiply(material.getUnitPrice()));
        }

        updateStockStatus(material);
        save(material);
    }

    private String generateBatchNo(String materialType) {
        String dateStr = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String uuid = UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        return materialType + "-" + dateStr + "-" + uuid;
    }

    @Transactional(rollbackFor = Exception.class)
    @CacheEvict(value = {"materialPage", "materialDetail"}, allEntries = true)
    public void updateMaterial(Material material) {
        Material exist = getById(material.getId());
        if (exist == null) {
            throw new BusinessException("原料不存在");
        }
        if (material.getQuantity() != null && material.getUnitPrice() != null) {
            material.setTotalAmount(material.getQuantity().multiply(material.getUnitPrice()));
        }
        updateStockStatus(material);
        updateById(material);
    }

    private void updateStockStatus(Material material) {
        if (material.getQuantity() == null) {
            material.setStockStatus(Constants.MATERIAL_STOCK_WARNING);
            return;
        }

        BigDecimal warningThreshold = new BigDecimal("100");
        BigDecimal stopThreshold = new BigDecimal("10");

        if (material.getQuantity().compareTo(stopThreshold) <= 0) {
            material.setStockStatus(Constants.MATERIAL_STOCK_STOP);
        } else if (material.getQuantity().compareTo(warningThreshold) <= 0) {
            material.setStockStatus(Constants.MATERIAL_STOCK_WARNING);
        } else {
            material.setStockStatus(Constants.MATERIAL_STOCK_SUFFICIENT);
        }
    }

    @Transactional(rollbackFor = Exception.class)
    public void lockMaterial(Long materialId, BigDecimal quantity, Long workOrderId, String workOrderNo, Long operatorId, String operatorName) {
        Material material = getById(materialId);
        if (material == null) {
            throw new BusinessException("原料不存在");
        }

        BigDecimal lockedQuantity = getLockedQuantity(materialId);
        BigDecimal availableQuantity = material.getQuantity().subtract(lockedQuantity);

        if (availableQuantity.compareTo(quantity) < 0) {
            throw new BusinessException("原料【" + material.getMaterialName() + "】可用库存不足，可用：" + availableQuantity + ", 需要：" + quantity);
        }

        MaterialLock lock = new MaterialLock();
        lock.setMaterialId(materialId);
        lock.setMaterialName(material.getMaterialName());
        lock.setBatchNo(material.getBatchNo());
        lock.setLockQuantity(quantity);
        lock.setLockType("WORK_ORDER");
        lock.setWorkOrderId(workOrderId);
        lock.setWorkOrderNo(workOrderNo);
        lock.setOperatorId(operatorId);
        lock.setOperatorName(operatorName);
        lock.setLockTime(LocalDateTime.now());
        lock.setExpireTime(LocalDateTime.now().plusHours(24));
        lock.setStatus(1);
        materialLockMapper.insert(lock);
    }

    public BigDecimal getLockedQuantity(Long materialId) {
        return materialLockMapper.selectList(new LambdaQueryWrapper<MaterialLock>()
                        .eq(MaterialLock::getMaterialId, materialId)
                        .eq(MaterialLock::getStatus, 1)
                        .gt(MaterialLock::getExpireTime, LocalDateTime.now()))
                .stream()
                .map(MaterialLock::getLockQuantity)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    @Transactional(rollbackFor = Exception.class)
    public void unlockMaterial(Long workOrderId) {
        materialLockMapper.delete(new LambdaQueryWrapper<MaterialLock>()
                .eq(MaterialLock::getWorkOrderId, workOrderId)
                .eq(MaterialLock::getStatus, 1));
    }

    @Transactional(rollbackFor = Exception.class)
    public void releaseMaterialLock(Long workOrderId) {
        materialLockMapper.selectList(new LambdaQueryWrapper<MaterialLock>()
                        .eq(MaterialLock::getWorkOrderId, workOrderId)
                        .eq(MaterialLock::getStatus, 1))
                .forEach(lock -> {
                    lock.setStatus(0);
                    materialLockMapper.updateById(lock);
                });
    }

    @Scheduled(cron = "0 0 * * * ?")
    @Transactional(rollbackFor = Exception.class)
    public void cleanExpiredLocks() {
        materialLockMapper.selectList(new LambdaQueryWrapper<MaterialLock>()
                        .eq(MaterialLock::getStatus, 1)
                        .lt(MaterialLock::getExpireTime, LocalDateTime.now()))
                .forEach(lock -> {
                    lock.setStatus(0);
                    materialLockMapper.updateById(lock);
                });
    }

    public void checkAndUpdateExpiryStatus() {
        list().forEach(material -> {
            if (material.getExpiryDate() != null) {
                long daysUntilExpiry = DateUtil.between(DateUtil.date(), DateUtil.date(material.getExpiryDate()), DateUnit.DAY);
                if (daysUntilExpiry <= 30 && daysUntilExpiry > 0) {
                    material.setStockStatus(Constants.MATERIAL_STOCK_WARNING);
                    updateById(material);
                } else if (daysUntilExpiry <= 0) {
                    material.setStatus(0);
                    material.setStockStatus(Constants.MATERIAL_STOCK_STOP);
                    updateById(material);
                }
            }
        });
    }

    @Cacheable(value = "materialDetail", key = "#id", unless = "#result == null")
    public Material getDetailById(Long id) {
        return getById(id);
    }
}
