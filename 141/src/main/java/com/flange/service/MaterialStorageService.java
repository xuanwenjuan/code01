package com.flange.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.flange.annotation.RequiresRole;
import com.flange.common.RoleConstants;
import com.flange.dto.InventoryCheckDto;
import com.flange.dto.MaterialDto;
import com.flange.dto.MaterialQueryDto;
import com.flange.entity.InventoryCheck;
import com.flange.entity.InventoryLog;
import com.flange.entity.MaterialLock;
import com.flange.entity.MaterialStorage;
import com.flange.exception.BusinessException;
import com.flange.mapper.InventoryCheckMapper;
import com.flange.mapper.InventoryLogMapper;
import com.flange.mapper.MaterialLockMapper;
import com.flange.mapper.MaterialStorageMapper;
import com.flange.util.BatchNoGenerator;
import com.flange.util.CacheUtil;
import com.flange.util.UserContext;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class MaterialStorageService {

    private final MaterialStorageMapper materialMapper;
    private final InventoryLogMapper inventoryLogMapper;
    private final InventoryCheckMapper inventoryCheckMapper;
    private final MaterialLockMapper materialLockMapper;
    private final CacheUtil cacheUtil;

    private static final String CACHE_MATERIAL_PREFIX = "material:";
    private static final String CACHE_INVENTORY_LOG_PREFIX = "inventory_log:";
    private static final String CACHE_LOCK_PREFIX = "material_lock:";

    @SuppressWarnings("unchecked")
    public IPage<MaterialStorage> queryMaterials(int page, int size, MaterialQueryDto queryDto) {
        String cacheKey = CACHE_MATERIAL_PREFIX + "query:" + page + ":" + size + ":" + queryDto.hashCode();
        Object cached = cacheUtil.get(cacheKey);
        if (cached != null) {
            return (IPage<MaterialStorage>) cached;
        }

        LambdaQueryWrapper<MaterialStorage> wrapper = buildQueryWrapper(queryDto);
        applySorting(wrapper, queryDto);
        IPage<MaterialStorage> result = materialMapper.selectPage(new Page<>(page, size), wrapper);
        cacheUtil.set(cacheKey, result, 5, TimeUnit.MINUTES);
        return result;
    }

    private LambdaQueryWrapper<MaterialStorage> buildQueryWrapper(MaterialQueryDto queryDto) {
        LambdaQueryWrapper<MaterialStorage> wrapper = new LambdaQueryWrapper<>();

        if (StringUtils.hasText(queryDto.getMaterialCode())) {
            wrapper.like(MaterialStorage::getMaterialCode, queryDto.getMaterialCode());
        }
        if (StringUtils.hasText(queryDto.getMaterialName())) {
            wrapper.like(MaterialStorage::getMaterialName, queryDto.getMaterialName());
        }
        if (StringUtils.hasText(queryDto.getMaterialType())) {
            wrapper.eq(MaterialStorage::getMaterialType, queryDto.getMaterialType());
        }
        if (StringUtils.hasText(queryDto.getBatchNo())) {
            wrapper.like(MaterialStorage::getBatchNo, queryDto.getBatchNo());
        }
        if (StringUtils.hasText(queryDto.getSpecification())) {
            wrapper.like(MaterialStorage::getSpecification, queryDto.getSpecification());
        }
        if (StringUtils.hasText(queryDto.getStatus())) {
            wrapper.eq(MaterialStorage::getStatus, queryDto.getStatus());
        }
        if (queryDto.getIsRustProne() != null) {
            wrapper.eq(MaterialStorage::getIsRustProne, queryDto.getIsRustProne());
        }
        if (StringUtils.hasText(queryDto.getSupplier())) {
            wrapper.like(MaterialStorage::getSupplier, queryDto.getSupplier());
        }
        if (queryDto.getMinQuantity() != null) {
            wrapper.ge(MaterialStorage::getQuantity, queryDto.getMinQuantity());
        }
        if (queryDto.getMaxQuantity() != null) {
            wrapper.le(MaterialStorage::getQuantity, queryDto.getMaxQuantity());
        }
        if (queryDto.getInTimeStart() != null) {
            wrapper.ge(MaterialStorage::getInTime, queryDto.getInTimeStart().atStartOfDay());
        }
        if (queryDto.getInTimeEnd() != null) {
            wrapper.le(MaterialStorage::getInTime, queryDto.getInTimeEnd().atTime(23, 59, 59));
        }
        if (Boolean.TRUE.equals(queryDto.getNeedWarning())) {
            wrapper.and(w -> w.eq(MaterialStorage::getStatus, "WARNING")
                    .or().apply("quantity <= warning_quantity"));
        }

        return wrapper;
    }

    private void applySorting(LambdaQueryWrapper<MaterialStorage> wrapper, MaterialQueryDto queryDto) {
        String sortField = queryDto.getSortField();
        String sortOrder = queryDto.getSortOrder();

        if (!StringUtils.hasText(sortField)) {
            sortField = "createTime";
            sortOrder = "desc";
        }

        boolean isAsc = "asc".equalsIgnoreCase(sortOrder);

        switch (sortField) {
            case "quantity":
                if (isAsc) {
                    wrapper.orderByAsc(MaterialStorage::getQuantity);
                } else {
                    wrapper.orderByDesc(MaterialStorage::getQuantity);
                }
                break;
            case "materialName":
                if (isAsc) {
                    wrapper.orderByAsc(MaterialStorage::getMaterialName);
                } else {
                    wrapper.orderByDesc(MaterialStorage::getMaterialName);
                }
                break;
            case "inTime":
                if (isAsc) {
                    wrapper.orderByAsc(MaterialStorage::getInTime);
                } else {
                    wrapper.orderByDesc(MaterialStorage::getInTime);
                }
                break;
            default:
                wrapper.orderByDesc(MaterialStorage::getCreateTime);
        }
    }

    @SuppressWarnings("unchecked")
    public List<MaterialStorage> getRustRemindList() {
        String cacheKey = CACHE_MATERIAL_PREFIX + "rust_remind";
        Object cached = cacheUtil.get(cacheKey);
        if (cached != null) {
            return (List<MaterialStorage>) cached;
        }

        LambdaQueryWrapper<MaterialStorage> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(MaterialStorage::getIsRustProne, 1)
               .le(MaterialStorage::getRustRemindDate, LocalDate.now())
               .orderByAsc(MaterialStorage::getRustRemindDate);
        List<MaterialStorage> result = materialMapper.selectList(wrapper);
        cacheUtil.set(cacheKey, result, 1, TimeUnit.HOURS);
        return result;
    }

    @Transactional(rollbackFor = Exception.class)
    @RequiresRole({RoleConstants.PURCHASE_SPECIALIST, RoleConstants.ADMIN})
    public void addMaterial(MaterialDto dto) {
        validateMaterialDto(dto);

        LambdaQueryWrapper<MaterialStorage> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(MaterialStorage::getMaterialCode, dto.getMaterialCode());
        if (materialMapper.selectCount(wrapper) > 0) {
            throw new BusinessException("物料编码已存在");
        }

        MaterialStorage material = new MaterialStorage();
        BeanUtils.copyProperties(dto, material);
        material.setBatchNo(BatchNoGenerator.generateBatchNo("MAT"));
        material.setCreateBy(UserContext.getUserId());
        material.setInTime(LocalDateTime.now());
        updateMaterialStatus(material);
        materialMapper.insert(material);

        recordInventoryLog(material.getId(), material.getBatchNo(), "IN",
                BigDecimal.ZERO, material.getQuantity(), material.getQuantity(), "采购入库", null);

        clearMaterialCache();
    }

    private void validateMaterialDto(MaterialDto dto) {
        if (!StringUtils.hasText(dto.getMaterialCode())) {
            throw new BusinessException("物料编码不能为空");
        }
        if (!StringUtils.hasText(dto.getMaterialName())) {
            throw new BusinessException("物料名称不能为空");
        }
        if (!StringUtils.hasText(dto.getMaterialType())) {
            throw new BusinessException("物料类型不能为空");
        }
        if (dto.getQuantity() == null || dto.getQuantity().compareTo(BigDecimal.ZERO) < 0) {
            throw new BusinessException("库存数量不能为负数");
        }
        if (dto.getWarningQuantity() != null && dto.getWarningQuantity().compareTo(BigDecimal.ZERO) < 0) {
            throw new BusinessException("预警数量不能为负数");
        }
    }

    @Transactional(rollbackFor = Exception.class)
    @RequiresRole({RoleConstants.PURCHASE_SPECIALIST, RoleConstants.ADMIN})
    public void updateMaterial(MaterialDto dto) {
        validateMaterialDto(dto);

        MaterialStorage material = materialMapper.selectById(dto.getId());
        if (material == null) {
            throw new BusinessException("物料不存在");
        }

        LambdaQueryWrapper<MaterialStorage> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(MaterialStorage::getMaterialCode, dto.getMaterialCode())
               .ne(MaterialStorage::getId, dto.getId());
        if (materialMapper.selectCount(wrapper) > 0) {
            throw new BusinessException("物料编码已存在");
        }

        BeanUtils.copyProperties(dto, material);
        updateMaterialStatus(material);
        materialMapper.updateById(material);

        clearMaterialCache();
    }

    @Transactional(rollbackFor = Exception.class)
    @RequiresRole({RoleConstants.ADMIN})
    public void deleteMaterial(Long id) {
        MaterialStorage material = materialMapper.selectById(id);
        if (material == null) {
            throw new BusinessException("物料不存在");
        }
        if (material.getQuantity().compareTo(BigDecimal.ZERO) > 0) {
            throw new BusinessException("库存数量大于0，无法删除");
        }

        LambdaQueryWrapper<MaterialLock> lockWrapper = new LambdaQueryWrapper<>();
        lockWrapper.eq(MaterialLock::getMaterialId, id)
                   .eq(MaterialLock::getStatus, "ACTIVE");
        if (materialLockMapper.selectCount(lockWrapper) > 0) {
            throw new BusinessException("该物料存在锁定记录，无法删除");
        }

        materialMapper.deleteById(id);
        clearMaterialCache();
    }

    @SuppressWarnings("unchecked")
    public MaterialStorage getMaterialById(Long id) {
        String cacheKey = CACHE_MATERIAL_PREFIX + id;
        Object cached = cacheUtil.get(cacheKey);
        if (cached != null) {
            return (MaterialStorage) cached;
        }

        MaterialStorage material = materialMapper.selectById(id);
        if (material != null) {
            cacheUtil.set(cacheKey, material, 10, TimeUnit.MINUTES);
        }
        return material;
    }

    @Transactional(rollbackFor = Exception.class)
    @RequiresRole({RoleConstants.PURCHASE_SPECIALIST, RoleConstants.LINE_LEADER, RoleConstants.ADMIN})
    public void updateStock(Long id, BigDecimal quantity, String operationType, String remark, Long relatedOrderId) {
        MaterialStorage material = materialMapper.selectById(id);
        if (material == null) {
            throw new BusinessException("物料不存在");
        }

        BigDecimal beforeQuantity = material.getQuantity();
        BigDecimal afterQuantity = beforeQuantity.add(quantity);

        if (afterQuantity.compareTo(BigDecimal.ZERO) < 0) {
            throw new BusinessException("库存不足");
        }

        material.setQuantity(afterQuantity);
        updateMaterialStatus(material);
        materialMapper.updateById(material);

        recordInventoryLog(id, material.getBatchNo(), operationType,
                beforeQuantity, quantity, afterQuantity, remark, relatedOrderId);

        clearMaterialCache();
    }

    @Transactional(rollbackFor = Exception.class)
    @RequiresRole({RoleConstants.LINE_LEADER, RoleConstants.ADMIN})
    public void lockMaterial(Long materialId, Long orderId, String orderNo, BigDecimal lockQuantity, String remark) {
        MaterialStorage material = materialMapper.selectById(materialId);
        if (material == null) {
            throw new BusinessException("物料不存在");
        }

        BigDecimal availableQuantity = getAvailableQuantity(materialId);
        if (availableQuantity.compareTo(lockQuantity) < 0) {
            throw new BusinessException("可用库存不足，当前可用：" + availableQuantity);
        }

        MaterialLock lock = new MaterialLock();
        lock.setMaterialId(materialId);
        lock.setMaterialName(material.getMaterialName());
        lock.setBatchNo(material.getBatchNo());
        lock.setOrderId(orderId);
        lock.setOrderNo(orderNo);
        lock.setLockQuantity(lockQuantity);
        lock.setLockType("ORDER");
        lock.setStatus("ACTIVE");
        lock.setOperatorId(UserContext.getUserId());
        lock.setOperatorName(UserContext.getUsername());
        lock.setExpireTime(LocalDateTime.now().plusHours(24));
        lock.setRemark(remark);
        materialLockMapper.insert(lock);

        cacheUtil.deleteByPattern(CACHE_LOCK_PREFIX + "*");
    }

    public BigDecimal getAvailableQuantity(Long materialId) {
        MaterialStorage material = materialMapper.selectById(materialId);
        if (material == null) {
            return BigDecimal.ZERO;
        }

        LambdaQueryWrapper<MaterialLock> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(MaterialLock::getMaterialId, materialId)
               .eq(MaterialLock::getStatus, "ACTIVE")
               .gt(MaterialLock::getExpireTime, LocalDateTime.now());
        List<MaterialLock> locks = materialLockMapper.selectList(wrapper);

        BigDecimal lockedQuantity = locks.stream()
                .map(MaterialLock::getLockQuantity)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return material.getQuantity().subtract(lockedQuantity);
    }

    @Transactional(rollbackFor = Exception.class)
    @RequiresRole({RoleConstants.LINE_LEADER, RoleConstants.ADMIN})
    public void releaseLock(Long lockId) {
        MaterialLock lock = materialLockMapper.selectById(lockId);
        if (lock == null) {
            throw new BusinessException("锁定记录不存在");
        }

        lock.setStatus("RELEASED");
        materialLockMapper.updateById(lock);

        cacheUtil.deleteByPattern(CACHE_LOCK_PREFIX + "*");
    }

    @Transactional(rollbackFor = Exception.class)
    @RequiresRole({RoleConstants.LINE_LEADER, RoleConstants.ADMIN})
    public void confirmLockUsage(Long lockId) {
        MaterialLock lock = materialLockMapper.selectById(lockId);
        if (lock == null) {
            throw new BusinessException("锁定记录不存在");
        }

        updateStock(lock.getMaterialId(), lock.getLockQuantity().negate(), "OUT",
                "工单领料确认", lock.getOrderId());

        lock.setStatus("USED");
        materialLockMapper.updateById(lock);

        cacheUtil.deleteByPattern(CACHE_LOCK_PREFIX + "*");
    }

    private void recordInventoryLog(Long materialId, String batchNo, String operationType,
                                    BigDecimal beforeQuantity, BigDecimal operationQuantity, BigDecimal afterQuantity,
                                    String remark, Long relatedOrderId) {
        InventoryLog log = new InventoryLog();
        log.setMaterialId(materialId);
        log.setBatchNo(batchNo);
        log.setOperationType(operationType);
        log.setBeforeQuantity(beforeQuantity);
        log.setOperationQuantity(operationQuantity);
        log.setAfterQuantity(afterQuantity);
        log.setOperatorId(UserContext.getUserId());
        log.setOperatorName(UserContext.getUsername());
        log.setRemark(remark);
        log.setRelatedOrderId(relatedOrderId);
        inventoryLogMapper.insert(log);
    }

    private void updateMaterialStatus(MaterialStorage material) {
        if (material.getQuantity().compareTo(BigDecimal.ZERO) <= 0) {
            material.setStatus("STOP_PURCHASE");
        } else if (material.getWarningQuantity() != null &&
                   material.getQuantity().compareTo(material.getWarningQuantity()) <= 0) {
            material.setStatus("WARNING");
        } else {
            material.setStatus("SUFFICIENT");
        }
    }

    @SuppressWarnings("unchecked")
    public IPage<InventoryLog> getInventoryLogPage(int page, int size, Long materialId, String operationType) {
        String cacheKey = CACHE_INVENTORY_LOG_PREFIX + "page:" + page + ":" + size + ":" + materialId + ":" + operationType;
        Object cached = cacheUtil.get(cacheKey);
        if (cached != null) {
            return (IPage<InventoryLog>) cached;
        }

        LambdaQueryWrapper<InventoryLog> wrapper = new LambdaQueryWrapper<>();
        if (materialId != null) {
            wrapper.eq(InventoryLog::getMaterialId, materialId);
        }
        if (operationType != null && !operationType.isEmpty()) {
            wrapper.eq(InventoryLog::getOperationType, operationType);
        }
        wrapper.orderByDesc(InventoryLog::getCreateTime);
        IPage<InventoryLog> result = inventoryLogMapper.selectPage(new Page<>(page, size), wrapper);
        cacheUtil.set(cacheKey, result, 5, TimeUnit.MINUTES);
        return result;
    }

    @Transactional(rollbackFor = Exception.class)
    @RequiresRole({RoleConstants.PURCHASE_SPECIALIST, RoleConstants.ADMIN})
    public void createInventoryCheck(InventoryCheckDto dto) {
        if (dto.getActualQuantity() == null || dto.getActualQuantity().compareTo(BigDecimal.ZERO) < 0) {
            throw new BusinessException("实际盘点数量不能为负数");
        }

        MaterialStorage material = materialMapper.selectById(dto.getMaterialId());
        if (material == null) {
            throw new BusinessException("物料不存在");
        }

        InventoryCheck check = new InventoryCheck();
        BeanUtils.copyProperties(dto, check);
        check.setCheckNo(BatchNoGenerator.generateBatchNo("IC"));
        check.setMaterialName(material.getMaterialName());
        check.setBatchNo(material.getBatchNo());
        check.setSystemQuantity(material.getQuantity());
        check.setDiffQuantity(dto.getActualQuantity().subtract(material.getQuantity()));
        check.setOperatorId(UserContext.getUserId());
        check.setOperatorName(UserContext.getUsername());
        check.setStatus("PENDING");
        inventoryCheckMapper.insert(check);
    }

    @Transactional(rollbackFor = Exception.class)
    @RequiresRole({RoleConstants.ADMIN})
    public void approveInventoryCheck(Long checkId, String diffReason, boolean adjustStock) {
        InventoryCheck check = inventoryCheckMapper.selectById(checkId);
        if (check == null) {
            throw new BusinessException("盘点记录不存在");
        }
        if (!"PENDING".equals(check.getStatus())) {
            throw new BusinessException("该盘点记录已处理");
        }

        check.setDiffReason(diffReason);
        check.setStatus("APPROVED");
        check.setApproverId(UserContext.getUserId());
        check.setApproverName(UserContext.getUsername());
        check.setApproveTime(LocalDateTime.now());
        inventoryCheckMapper.updateById(check);

        if (adjustStock && check.getDiffQuantity().compareTo(BigDecimal.ZERO) != 0) {
            MaterialStorage material = materialMapper.selectById(check.getMaterialId());
            if (material != null) {
                BigDecimal beforeQuantity = material.getQuantity();
                material.setQuantity(check.getActualQuantity());
                updateMaterialStatus(material);
                materialMapper.updateById(material);

                recordInventoryLog(check.getMaterialId(), check.getBatchNo(), "ADJUST",
                        beforeQuantity, check.getDiffQuantity(), check.getActualQuantity(), "库存盘点调整", null);
            }
        }

        clearMaterialCache();
    }

    @SuppressWarnings("unchecked")
    public IPage<InventoryCheck> getInventoryCheckPage(int page, int size, String status) {
        LambdaQueryWrapper<InventoryCheck> wrapper = new LambdaQueryWrapper<>();
        if (status != null && !status.isEmpty()) {
            wrapper.eq(InventoryCheck::getStatus, status);
        }
        wrapper.orderByDesc(InventoryCheck::getCreateTime);
        return inventoryCheckMapper.selectPage(new Page<>(page, size), wrapper);
    }

    @SuppressWarnings("unchecked")
    public IPage<MaterialLock> getMaterialLockPage(int page, int size, Long materialId, Long orderId, String status) {
        LambdaQueryWrapper<MaterialLock> wrapper = new LambdaQueryWrapper<>();
        if (materialId != null) {
            wrapper.eq(MaterialLock::getMaterialId, materialId);
        }
        if (orderId != null) {
            wrapper.eq(MaterialLock::getOrderId, orderId);
        }
        if (status != null && !status.isEmpty()) {
            wrapper.eq(MaterialLock::getStatus, status);
        }
        wrapper.orderByDesc(MaterialLock::getCreateTime);
        return materialLockMapper.selectPage(new Page<>(page, size), wrapper);
    }

    private void clearMaterialCache() {
        cacheUtil.deleteByPattern(CACHE_MATERIAL_PREFIX + "*");
        cacheUtil.deleteByPattern(CACHE_INVENTORY_LOG_PREFIX + "*");
    }
}
