package com.woodendoor.production.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.woodendoor.production.annotation.OperationLog;
import com.woodendoor.production.entity.Material;
import com.woodendoor.production.entity.MaterialLock;
import com.woodendoor.production.exception.BusinessException;
import com.woodendoor.production.mapper.MaterialLockMapper;
import com.woodendoor.production.mapper.MaterialMapper;
import com.woodendoor.production.util.RedisUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Random;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class MaterialService extends ServiceImpl<MaterialMapper, Material> {

    private final RedisUtil redisUtil;
    private final MaterialLockMapper materialLockMapper;

    @Value("${material.warning.threshold:100}")
    private BigDecimal warningThreshold;

    private static final String MATERIAL_CACHE_KEY = "material:all";
    private static final String MATERIAL_WARNING_KEY = "material:warning";

    public String generateBatchCode() {
        String prefix = "MAT";
        String date = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String random = String.format("%04d", new Random().nextInt(10000));
        return prefix + date + random;
    }

    @Transactional(rollbackFor = Exception.class)
    @OperationLog(module = "原料管理", operation = "新增原料")
    public void addMaterial(Material material) {
        material.setBatchCode(generateBatchCode());
        material.setInDate(LocalDateTime.now());
        material.setStatus(1);
        if (material.getIsDamp() == null) {
            material.setIsDamp(0);
        }
        if (material.getLockedQuantity() == null) {
            material.setLockedQuantity(BigDecimal.ZERO);
        }
        save(material);
        checkAndUpdateStatus(material);
        clearMaterialCache();
    }

    @Transactional(rollbackFor = Exception.class)
    @OperationLog(module = "原料管理", operation = "原料入库")
    public void stockIn(Long id, BigDecimal quantity) {
        Material material = getById(id);
        if (material == null) {
            throw new BusinessException("原料不存在");
        }
        if (quantity.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("入库数量必须大于0");
        }
        material.setQuantity(material.getQuantity().add(quantity));
        checkAndUpdateStatus(material);
        updateById(material);
        clearMaterialCache();
    }

    @Transactional(rollbackFor = Exception.class)
    @OperationLog(module = "原料管理", operation = "原料出库")
    public void stockOut(Long id, BigDecimal quantity) {
        Material material = getById(id);
        if (material == null) {
            throw new BusinessException("原料不存在");
        }
        if (quantity.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("出库数量必须大于0");
        }
        BigDecimal availableQuantity = material.getQuantity().subtract(material.getLockedQuantity());
        if (availableQuantity.compareTo(quantity) < 0) {
            throw new BusinessException("可用库存不足，当前可用：" + availableQuantity);
        }
        material.setQuantity(material.getQuantity().subtract(quantity));
        checkAndUpdateStatus(material);
        updateById(material);
        clearMaterialCache();
    }

    @Transactional(rollbackFor = Exception.class)
    @OperationLog(module = "原料管理", operation = "锁定库存")
    public void lockMaterial(Long orderId, String orderNo, Long materialId, BigDecimal quantity, String remark) {
        Material material = getById(materialId);
        if (material == null) {
            throw new BusinessException("原料不存在");
        }
        BigDecimal availableQuantity = material.getQuantity().subtract(material.getLockedQuantity());
        if (availableQuantity.compareTo(quantity) < 0) {
            throw new BusinessException("可用库存不足，当前可用：" + availableQuantity);
        }

        material.setLockedQuantity(material.getLockedQuantity().add(quantity));
        updateById(material);

        MaterialLock lock = new MaterialLock();
        lock.setOrderId(orderId);
        lock.setOrderNo(orderNo);
        lock.setMaterialId(materialId);
        lock.setMaterialName(material.getName());
        lock.setMaterialType(material.getMaterialType());
        lock.setQuantity(quantity);
        lock.setUnitPrice(material.getUnitPrice());
        lock.setTotalPrice(material.getUnitPrice().multiply(quantity));
        lock.setStatus(1);
        lock.setLockTime(LocalDateTime.now());
        lock.setRemark(remark);
        materialLockMapper.insert(lock);

        clearMaterialCache();
    }

    @Transactional(rollbackFor = Exception.class)
    @OperationLog(module = "原料管理", operation = "解锁库存")
    public void unlockMaterial(Long orderId, Long materialId) {
        LambdaQueryWrapper<MaterialLock> wrapper = new LambdaQueryWrapper<MaterialLock>()
                .eq(MaterialLock::getOrderId, orderId)
                .eq(MaterialLock::getStatus, 1);
        if (materialId != null) {
            wrapper.eq(MaterialLock::getMaterialId, materialId);
        }
        List<MaterialLock> locks = materialLockMapper.selectList(wrapper);

        for (MaterialLock lock : locks) {
            Material material = getById(lock.getMaterialId());
            if (material != null) {
                material.setLockedQuantity(material.getLockedQuantity().subtract(lock.getQuantity()));
                updateById(material);
            }
            lock.setStatus(0);
            lock.setUnlockTime(LocalDateTime.now());
            materialLockMapper.updateById(lock);
        }

        clearMaterialCache();
    }

    @Transactional(rollbackFor = Exception.class)
    @OperationLog(module = "原料管理", operation = "扣减锁定库存")
    public void deductLockedMaterial(Long orderId, Long materialId) {
        LambdaQueryWrapper<MaterialLock> wrapper = new LambdaQueryWrapper<MaterialLock>()
                .eq(MaterialLock::getOrderId, orderId)
                .eq(MaterialLock::getStatus, 1);
        if (materialId != null) {
            wrapper.eq(MaterialLock::getMaterialId, materialId);
        }
        List<MaterialLock> locks = materialLockMapper.selectList(wrapper);

        for (MaterialLock lock : locks) {
            Material material = getById(lock.getMaterialId());
            if (material != null) {
                material.setQuantity(material.getQuantity().subtract(lock.getQuantity()));
                material.setLockedQuantity(material.getLockedQuantity().subtract(lock.getQuantity()));
                checkAndUpdateStatus(material);
                updateById(material);
            }
            lock.setStatus(2);
            lock.setUnlockTime(LocalDateTime.now());
            materialLockMapper.updateById(lock);
        }

        clearMaterialCache();
    }

    private void checkAndUpdateStatus(Material material) {
        if (material.getQuantity().compareTo(BigDecimal.ZERO) == 0) {
            material.setStatus(3);
        } else if (material.getQuantity().compareTo(warningThreshold) <= 0) {
            material.setStatus(2);
            addWarning(material);
        } else {
            material.setStatus(1);
        }
    }

    private void addWarning(Material material) {
        String warningKey = MATERIAL_WARNING_KEY + ":" + material.getId();
        if (!redisUtil.hasKey(warningKey)) {
            redisUtil.set(warningKey, material.getName() + "库存不足，请及时采购", 24, TimeUnit.HOURS);
        }
    }

    public List<Material> getWarningList() {
        return list(new LambdaQueryWrapper<Material>()
                .eq(Material::getStatus, 2)
                .orderByAsc(Material::getQuantity));
    }

    @Transactional(rollbackFor = Exception.class)
    @OperationLog(module = "原料管理", operation = "更新状态")
    public void updateStatus(Long id, Integer status) {
        Material material = getById(id);
        if (material == null) {
            throw new BusinessException("原料不存在");
        }
        material.setStatus(status);
        updateById(material);
        clearMaterialCache();
    }

    @OperationLog(module = "原料管理", operation = "设置通风提醒")
    public void setVentilateRemind(Long id, LocalDateTime remindTime) {
        Material material = getById(id);
        if (material == null) {
            throw new BusinessException("原料不存在");
        }
        material.setIsDamp(1);
        material.setVentilateRemindTime(remindTime);
        updateById(material);
    }

    @OperationLog(module = "原料管理", operation = "标记已通风")
    public void markVentilated(Long id) {
        Material material = getById(id);
        if (material == null) {
            throw new BusinessException("原料不存在");
        }
        material.setIsDamp(0);
        material.setVentilateRemindTime(null);
        updateById(material);
    }

    @SuppressWarnings("unchecked")
    public List<Material> getAllMaterials() {
        List<Material> cached = (List<Material>) redisUtil.get(MATERIAL_CACHE_KEY);
        if (cached != null) {
            return cached;
        }
        List<Material> all = list();
        redisUtil.set(MATERIAL_CACHE_KEY, all, 1, TimeUnit.HOURS);
        return all;
    }

    private void clearMaterialCache() {
        redisUtil.delete(MATERIAL_CACHE_KEY);
    }

    public Page<Material> page(Integer pageNum, Integer pageSize, Integer status, String type, String materialType) {
        Page<Material> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<Material> wrapper = new LambdaQueryWrapper<>();
        if (status != null) {
            wrapper.eq(Material::getStatus, status);
        }
        if (type != null && !type.isEmpty()) {
            wrapper.eq(Material::getType, type);
        }
        if (materialType != null && !materialType.isEmpty()) {
            wrapper.like(Material::getMaterialType, materialType);
        }
        wrapper.orderByDesc(Material::getCreateTime);
        return page(page, wrapper);
    }

    public List<Material> getVentilateRemindList() {
        return list(new LambdaQueryWrapper<Material>()
                .eq(Material::getIsDamp, 1)
                .le(Material::getVentilateRemindTime, LocalDateTime.now())
                .orderByAsc(Material::getVentilateRemindTime));
    }

    public BigDecimal getAvailableQuantity(Long materialId) {
        Material material = getById(materialId);
        if (material == null) {
            return BigDecimal.ZERO;
        }
        return material.getQuantity().subtract(material.getLockedQuantity());
    }

    public List<MaterialLock> getMaterialLocksByOrder(Long orderId) {
        return materialLockMapper.selectList(new LambdaQueryWrapper<MaterialLock>()
                .eq(MaterialLock::getOrderId, orderId)
                .orderByDesc(MaterialLock::getLockTime));
    }
}
