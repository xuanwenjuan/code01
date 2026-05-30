package com.zongshi.brush.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.zongshi.brush.dto.MaterialArchiveDTO;
import com.zongshi.brush.dto.MaterialQueryDTO;
import com.zongshi.brush.entity.BrushCategory;
import com.zongshi.brush.entity.MaterialArchive;
import com.zongshi.brush.entity.MaterialLockLog;
import com.zongshi.brush.exception.BusinessException;
import com.zongshi.brush.mapper.BrushCategoryMapper;
import com.zongshi.brush.mapper.MaterialArchiveMapper;
import com.zongshi.brush.mapper.MaterialLockLogMapper;
import com.zongshi.brush.util.UserContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class MaterialArchiveService extends ServiceImpl<MaterialArchiveMapper, MaterialArchive> {

    private final BrushCategoryMapper brushCategoryMapper;
    private final MaterialLockLogMapper materialLockLogMapper;

    @Transactional(rollbackFor = Exception.class)
    public Long addMaterial(MaterialArchiveDTO dto) {
        validateMaterialData(dto);

        LambdaQueryWrapper<MaterialArchive> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(MaterialArchive::getMaterialCode, dto.getMaterialCode());
        wrapper.eq(MaterialArchive::getIsDeleted, 0);
        Long count = this.baseMapper.selectCount(wrapper);
        if (count > 0) {
            throw new BusinessException("原料编号已存在");
        }

        validateCategory(dto.getCategoryId());

        MaterialArchive material = new MaterialArchive();
        BeanUtils.copyProperties(dto, material);
        initMaterialStock(material);
        updateMaterialStatus(material);

        this.baseMapper.insert(material);
        return material.getId();
    }

    @Transactional(rollbackFor = Exception.class)
    public void updateMaterial(MaterialArchiveDTO dto) {
        if (dto.getId() == null) {
            throw new BusinessException("原料ID不能为空");
        }
        validateMaterialData(dto);

        MaterialArchive exist = getMaterialById(dto.getId());

        LambdaQueryWrapper<MaterialArchive> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(MaterialArchive::getMaterialCode, dto.getMaterialCode());
        wrapper.eq(MaterialArchive::getIsDeleted, 0);
        wrapper.ne(MaterialArchive::getId, dto.getId());
        Long count = this.baseMapper.selectCount(wrapper);
        if (count > 0) {
            throw new BusinessException("原料编号已存在");
        }

        if (dto.getCategoryId() != null && !dto.getCategoryId().equals(exist.getCategoryId())) {
            validateCategory(dto.getCategoryId());
        }

        MaterialArchive material = new MaterialArchive();
        BeanUtils.copyProperties(dto, material);
        calculateAvailableQuantity(material);
        updateMaterialStatus(material);

        this.baseMapper.updateById(material);
    }

    @Transactional(rollbackFor = Exception.class)
    public void deleteMaterial(Long id) {
        MaterialArchive material = getMaterialById(id);
        if (material.getLockedQuantity() != null && material.getLockedQuantity().compareTo(BigDecimal.ZERO) > 0) {
            throw new BusinessException("该原料有锁定库存，无法删除");
        }
        this.baseMapper.deleteById(id);
    }

    public MaterialArchive getMaterialById(Long id) {
        MaterialArchive material = this.baseMapper.selectById(id);
        if (material == null || material.getIsDeleted() == 1) {
            throw new BusinessException("原料不存在");
        }
        return material;
    }

    public Page<MaterialArchive> queryMaterialPage(MaterialQueryDTO dto) {
        Page<MaterialArchive> page = new Page<>(dto.getPageNum(), dto.getPageSize());
        LambdaQueryWrapper<MaterialArchive> wrapper = buildQueryWrapper(dto);
        wrapper.orderByDesc(MaterialArchive::getCreateTime);
        return this.baseMapper.selectPage(page, wrapper);
    }

    public List<MaterialArchive> queryMaterialList(MaterialQueryDTO dto) {
        LambdaQueryWrapper<MaterialArchive> wrapper = buildQueryWrapper(dto);
        wrapper.orderByDesc(MaterialArchive::getCreateTime);
        return this.baseMapper.selectList(wrapper);
    }

    public List<MaterialArchive> getWarningMaterials() {
        return this.baseMapper.selectWarningMaterials();
    }

    public List<MaterialArchive> getExpiringMoistureMaterials(Integer days) {
        if (days == null) {
            days = 7;
        }
        return this.baseMapper.selectExpiringMoistureMaterials(days);
    }

    @Transactional(rollbackFor = Exception.class)
    public void lockMaterial(Long orderId, Long materialId, BigDecimal quantity, String remark) {
        MaterialArchive material = getMaterialById(materialId);

        if (material.getAvailableQuantity().compareTo(quantity) < 0) {
            throw new BusinessException("原料[" + material.getMaterialName() + "]库存不足，可用：" + material.getAvailableQuantity());
        }

        material.setLockedQuantity(material.getLockedQuantity().add(quantity));
        calculateAvailableQuantity(material);
        updateMaterialStatus(material);
        this.baseMapper.updateById(material);

        MaterialLockLog lockLog = new MaterialLockLog();
        lockLog.setOrderId(orderId);
        lockLog.setMaterialId(materialId);
        lockLog.setMaterialName(material.getMaterialName());
        lockLog.setLockQuantity(quantity);
        lockLog.setUnlockQuantity(BigDecimal.ZERO);
        lockLog.setLockType(1);
        lockLog.setLockStatus(1);
        lockLog.setOperatorId(UserContext.getUserId());
        lockLog.setOperatorName(UserContext.getUsername());
        lockLog.setRemark(remark);
        lockLog.setCreateTime(LocalDateTime.now());
        lockLog.setUpdateTime(LocalDateTime.now());
        materialLockLogMapper.insert(lockLog);
    }

    @Transactional(rollbackFor = Exception.class)
    public void unlockMaterial(Long orderId, Long materialId, BigDecimal quantity, String remark) {
        List<MaterialLockLog> lockLogs = materialLockLogMapper.selectByOrderId(orderId);
        if (lockLogs.isEmpty()) {
            return;
        }

        for (MaterialLockLog lockLog : lockLogs) {
            if (lockLog.getMaterialId().equals(materialId) && lockLog.getLockStatus() == 1) {
                BigDecimal remainingLocked = lockLog.getLockQuantity().subtract(lockLog.getUnlockQuantity());
                BigDecimal unlockQty = remainingLocked.compareTo(quantity) >= 0 ? quantity : remainingLocked;

                lockLog.setUnlockQuantity(lockLog.getUnlockQuantity().add(unlockQty));
                if (lockLog.getUnlockQuantity().compareTo(lockLog.getLockQuantity()) >= 0) {
                    lockLog.setLockStatus(2);
                }
                lockLog.setUpdateTime(LocalDateTime.now());
                materialLockLogMapper.updateById(lockLog);

                MaterialArchive material = getMaterialById(materialId);
                material.setLockedQuantity(material.getLockedQuantity().subtract(unlockQty));
                calculateAvailableQuantity(material);
                updateMaterialStatus(material);
                this.baseMapper.updateById(material);
            }
        }
    }

    @Transactional(rollbackFor = Exception.class)
    public void unlockAllMaterialByOrder(Long orderId) {
        List<MaterialLockLog> lockLogs = materialLockLogMapper.selectByOrderId(orderId);
        for (MaterialLockLog lockLog : lockLogs) {
            if (lockLog.getLockStatus() == 1) {
                BigDecimal unlockQty = lockLog.getLockQuantity().subtract(lockLog.getUnlockQuantity());
                if (unlockQty.compareTo(BigDecimal.ZERO) > 0) {
                    unlockMaterial(orderId, lockLog.getMaterialId(), unlockQty, "工单解锁");
                }
            }
        }
    }

    @Transactional(rollbackFor = Exception.class)
    public void consumeMaterial(Long orderId, Long materialId, BigDecimal quantity) {
        List<MaterialLockLog> lockLogs = materialLockLogMapper.selectByOrderId(orderId);
        for (MaterialLockLog lockLog : lockLogs) {
            if (lockLog.getMaterialId().equals(materialId) && lockLog.getLockStatus() == 1) {
                BigDecimal consumeQty = lockLog.getLockQuantity().subtract(lockLog.getUnlockQuantity());
                if (consumeQty.compareTo(quantity) >= 0) {
                    consumeQty = quantity;
                }

                lockLog.setUnlockQuantity(lockLog.getUnlockQuantity().add(consumeQty));
                if (lockLog.getUnlockQuantity().compareTo(lockLog.getLockQuantity()) >= 0) {
                    lockLog.setLockStatus(3);
                }
                lockLog.setUpdateTime(LocalDateTime.now());
                materialLockLogMapper.updateById(lockLog);

                MaterialArchive material = getMaterialById(materialId);
                material.setStockQuantity(material.getStockQuantity().subtract(consumeQty));
                material.setLockedQuantity(material.getLockedQuantity().subtract(consumeQty));
                calculateAvailableQuantity(material);
                updateMaterialStatus(material);
                this.baseMapper.updateById(material);
            }
        }
    }

    private LambdaQueryWrapper<MaterialArchive> buildQueryWrapper(MaterialQueryDTO dto) {
        LambdaQueryWrapper<MaterialArchive> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(MaterialArchive::getIsDeleted, 0);

        if (StringUtils.hasText(dto.getMaterialName())) {
            wrapper.like(MaterialArchive::getMaterialName, dto.getMaterialName());
        }
        if (StringUtils.hasText(dto.getMaterialCode())) {
            wrapper.like(MaterialArchive::getMaterialCode, dto.getMaterialCode());
        }
        if (dto.getMaterialType() != null) {
            wrapper.eq(MaterialArchive::getMaterialType, dto.getMaterialType());
        }
        if (StringUtils.hasText(dto.getGrade())) {
            wrapper.eq(MaterialArchive::getGrade, dto.getGrade());
        }
        if (dto.getStatus() != null) {
            wrapper.eq(MaterialArchive::getStatus, dto.getStatus());
        }
        if (dto.getIsMoistureSensitive() != null) {
            wrapper.eq(MaterialArchive::getIsMoistureSensitive, dto.getIsMoistureSensitive());
        }
        if (dto.getCategoryId() != null) {
            wrapper.eq(MaterialArchive::getCategoryId, dto.getCategoryId());
        }
        return wrapper;
    }

    private void validateCategory(Long categoryId) {
        if (categoryId == null) {
            return;
        }
        BrushCategory category = brushCategoryMapper.selectById(categoryId);
        if (category == null || category.getIsDeleted() == 1) {
            throw new BusinessException("关联类目不存在");
        }
        if (category.getStatus() == 0) {
            throw new BusinessException("该类目已下架停产，不能绑定原料");
        }
    }

    private void initMaterialStock(MaterialArchive material) {
        if (material.getStockQuantity() == null) {
            material.setStockQuantity(BigDecimal.ZERO);
        }
        if (material.getLockedQuantity() == null) {
            material.setLockedQuantity(BigDecimal.ZERO);
        }
        if (material.getWarningQuantity() == null) {
            material.setWarningQuantity(new BigDecimal("10"));
        }
        calculateAvailableQuantity(material);
    }

    private void calculateAvailableQuantity(MaterialArchive material) {
        BigDecimal available = material.getStockQuantity().subtract(material.getLockedQuantity());
        material.setAvailableQuantity(available.compareTo(BigDecimal.ZERO) >= 0 ? available : BigDecimal.ZERO);
    }

    private void updateMaterialStatus(MaterialArchive material) {
        if (material.getStatus() != null && material.getStatus() == 3) {
            return;
        }
        if (material.getAvailableQuantity() != null && material.getWarningQuantity() != null) {
            if (material.getAvailableQuantity().compareTo(material.getWarningQuantity()) <= 0) {
                material.setStatus(2);
            } else {
                material.setStatus(1);
            }
        }
    }

    private void validateMaterialData(MaterialArchiveDTO dto) {
        if (dto.getMaterialType() == null || dto.getMaterialType() < 1 || dto.getMaterialType() > 4) {
            throw new BusinessException("原料类型不正确，范围：1-4");
        }
    }
}
