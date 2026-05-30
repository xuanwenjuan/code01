package com.foundry.impeller.service;

import cn.hutool.core.date.DateUnit;
import cn.hutool.core.date.DateUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.foundry.impeller.dto.MaterialQueryDTO;
import com.foundry.impeller.entity.Material;
import com.foundry.impeller.entity.MaterialInbound;
import com.foundry.impeller.entity.MaterialStockLock;
import com.foundry.impeller.enums.MaterialStatus;
import com.foundry.impeller.exception.BusinessException;
import com.foundry.impeller.mapper.MaterialInboundMapper;
import com.foundry.impeller.mapper.MaterialMapper;
import com.foundry.impeller.mapper.MaterialStockLockMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MaterialService {

    private final MaterialMapper materialMapper;
    private final MaterialStockLockMapper stockLockMapper;
    private final MaterialInboundMapper materialInboundMapper;

    public Page<Material> list(int page, int size, String materialType, String status) {
        LambdaQueryWrapper<Material> wrapper = new LambdaQueryWrapper<>();
        if (materialType != null && !materialType.isEmpty()) {
            wrapper.eq(Material::getMaterialType, materialType);
        }
        if (status != null && !status.isEmpty()) {
            wrapper.eq(Material::getStatus, status);
        }
        wrapper.orderByDesc(Material::getCreateTime);
        return materialMapper.selectPage(new Page<>(page, size), wrapper);
    }

    public Page<Material> queryByConditions(int page, int size, MaterialQueryDTO queryDTO) {
        LambdaQueryWrapper<Material> wrapper = new LambdaQueryWrapper<>();
        if (queryDTO.getMaterialType() != null && !queryDTO.getMaterialType().isEmpty()) {
            wrapper.eq(Material::getMaterialType, queryDTO.getMaterialType());
        }
        if (queryDTO.getMaterialName() != null && !queryDTO.getMaterialName().isEmpty()) {
            wrapper.like(Material::getMaterialName, queryDTO.getMaterialName());
        }
        if (queryDTO.getSpecification() != null && !queryDTO.getSpecification().isEmpty()) {
            wrapper.like(Material::getSpecification, queryDTO.getSpecification());
        }
        if (queryDTO.getStatus() != null && !queryDTO.getStatus().isEmpty()) {
            wrapper.eq(Material::getStatus, queryDTO.getStatus());
        }
        if (queryDTO.getSupplier() != null && !queryDTO.getSupplier().isEmpty()) {
            wrapper.like(Material::getSupplier, queryDTO.getSupplier());
        }
        if (queryDTO.getBatchNo() != null && !queryDTO.getBatchNo().isEmpty()) {
            wrapper.like(Material::getBatchNo, queryDTO.getBatchNo());
        }
        if (queryDTO.getMinQuantity() != null) {
            wrapper.ge(Material::getQuantity, queryDTO.getMinQuantity());
        }
        if (queryDTO.getMaxQuantity() != null) {
            wrapper.le(Material::getQuantity, queryDTO.getMaxQuantity());
        }
        wrapper.orderByDesc(Material::getCreateTime);
        return materialMapper.selectPage(new Page<>(page, size), wrapper);
    }

    public List<Material> listWarning() {
        LambdaQueryWrapper<Material> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Material::getStatus, MaterialStatus.WARNING.getCode())
                .orderByDesc(Material::getCreateTime);
        return materialMapper.selectList(wrapper);
    }

    public List<Material> listClumpingWarning() {
        LambdaQueryWrapper<Material> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Material::getIsEasyClumping, 1);
        List<Material> materials = materialMapper.selectList(wrapper);
        LocalDate now = LocalDate.now();
        return materials.stream()
                .filter(m -> {
                    if (m.getProductionDate() == null || m.getStorageDays() == null) {
                        return false;
                    }
                    long days = DateUtil.between(
                            DateUtil.date(m.getProductionDate()),
                            DateUtil.date(now),
                            DateUnit.DAY
                    );
                    return days > m.getStorageDays();
                })
                .toList();
    }

    public Material getById(Long id) {
        return materialMapper.selectById(id);
    }

    public void create(Material material) {
        LambdaQueryWrapper<Material> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Material::getBatchNo, material.getBatchNo());
        Material exist = materialMapper.selectOne(wrapper);
        if (exist != null) {
            throw new BusinessException("批次编号已存在");
        }
        updateMaterialStatus(material);
        materialMapper.insert(material);
    }

    public void update(Material material) {
        updateMaterialStatus(material);
        materialMapper.updateById(material);
    }

    private void updateMaterialStatus(Material material) {
        if (material.getQuantity() == null) {
            material.setQuantity(BigDecimal.ZERO);
        }
        if (material.getWarningQuantity() == null) {
            material.setWarningQuantity(BigDecimal.ZERO);
        }
        if (material.getStatus() == null || !MaterialStatus.STOP.getCode().equals(material.getStatus())) {
            if (material.getQuantity().compareTo(material.getWarningQuantity()) <= 0) {
                material.setStatus(MaterialStatus.WARNING.getCode());
            } else {
                material.setStatus(MaterialStatus.NORMAL.getCode());
            }
        }
    }

    public void delete(Long id) {
        materialMapper.deleteById(id);
    }

    public void updateStock(Long id, BigDecimal quantity) {
        Material material = materialMapper.selectById(id);
        if (material == null) {
            throw new BusinessException("物料不存在");
        }
        material.setQuantity(material.getQuantity().add(quantity));
        update(material);
    }

    @Transactional(rollbackFor = Exception.class)
    public void inbound(MaterialInbound inbound) {
        Material material = materialMapper.selectById(inbound.getMaterialId());
        if (material == null) {
            throw new BusinessException("物料不存在");
        }

        inbound.setMaterialName(material.getMaterialName());
        inbound.setMaterialType(material.getMaterialType());
        inbound.setBatchNo(material.getBatchNo());
        inbound.setUnit(material.getUnit());
        inbound.setTotalAmount(inbound.getQuantity().multiply(inbound.getUnitPrice()));
        inbound.setStatus("COMPLETED");
        materialInboundMapper.insert(inbound);

        material.setQuantity(material.getQuantity().add(inbound.getQuantity()));
        update(material);
    }

    @Transactional(rollbackFor = Exception.class)
    public void lockStock(Long workOrderId, List<MaterialStockLock> lockList) {
        for (MaterialStockLock lock : lockList) {
            Material material = materialMapper.selectById(lock.getMaterialId());
            if (material == null) {
                throw new BusinessException("物料不存在：" + lock.getMaterialName());
            }

            BigDecimal availableStock = material.getQuantity().subtract(
                    material.getLockQuantity() != null ? material.getLockQuantity() : BigDecimal.ZERO
            );
            if (availableStock.compareTo(lock.getLockQuantity()) < 0) {
                throw new BusinessException("物料库存不足：" + material.getMaterialName());
            }

            lock.setWorkOrderId(workOrderId);
            lock.setMaterialName(material.getMaterialName());
            lock.setBatchNo(material.getBatchNo());
            lock.setLockTime(LocalDateTime.now());
            lock.setStatus("LOCKED");
            stockLockMapper.insert(lock);

            material.setLockQuantity(
                    (material.getLockQuantity() != null ? material.getLockQuantity() : BigDecimal.ZERO)
                            .add(lock.getLockQuantity())
            );
            materialMapper.updateById(material);
        }
    }

    @Transactional(rollbackFor = Exception.class)
    public void unlockStock(Long workOrderId) {
        LambdaQueryWrapper<MaterialStockLock> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(MaterialStockLock::getWorkOrderId, workOrderId)
                .eq(MaterialStockLock::getStatus, "LOCKED");
        List<MaterialStockLock> lockList = stockLockMapper.selectList(wrapper);

        for (MaterialStockLock lock : lockList) {
            Material material = materialMapper.selectById(lock.getMaterialId());
            if (material != null) {
                material.setLockQuantity(
                        material.getLockQuantity().subtract(lock.getLockQuantity())
                );
                materialMapper.updateById(material);
            }

            lock.setStatus("UNLOCKED");
            lock.setUnlockTime(LocalDateTime.now());
            stockLockMapper.updateById(lock);
        }
    }

    @Transactional(rollbackFor = Exception.class)
    public void deductStock(Long workOrderId) {
        LambdaQueryWrapper<MaterialStockLock> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(MaterialStockLock::getWorkOrderId, workOrderId)
                .eq(MaterialStockLock::getStatus, "LOCKED");
        List<MaterialStockLock> lockList = stockLockMapper.selectList(wrapper);

        for (MaterialStockLock lock : lockList) {
            Material material = materialMapper.selectById(lock.getMaterialId());
            if (material == null) {
                throw new BusinessException("物料不存在");
            }

            material.setQuantity(material.getQuantity().subtract(lock.getLockQuantity()));
            material.setLockQuantity(material.getLockQuantity().subtract(lock.getLockQuantity()));
            materialMapper.updateById(material);

            lock.setStatus("DEDUCTED");
            lock.setUnlockTime(LocalDateTime.now());
            stockLockMapper.updateById(lock);
        }
    }

    public Page<MaterialInbound> listInbound(int page, int size, String materialType, String status) {
        LambdaQueryWrapper<MaterialInbound> wrapper = new LambdaQueryWrapper<>();
        if (materialType != null && !materialType.isEmpty()) {
            wrapper.eq(MaterialInbound::getMaterialType, materialType);
        }
        if (status != null && !status.isEmpty()) {
            wrapper.eq(MaterialInbound::getStatus, status);
        }
        wrapper.orderByDesc(MaterialInbound::getCreateTime);
        return materialInboundMapper.selectPage(new Page<>(page, size), wrapper);
    }
}
