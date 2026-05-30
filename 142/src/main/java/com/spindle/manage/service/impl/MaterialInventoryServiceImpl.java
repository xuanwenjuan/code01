package com.spindle.manage.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.spindle.manage.dto.MaterialOutDTO;
import com.spindle.manage.dto.MaterialQueryDTO;
import com.spindle.manage.entity.InventoryLockRecord;
import com.spindle.manage.entity.InventoryOperationLog;
import com.spindle.manage.entity.MaterialInventory;
import com.spindle.manage.entity.ProductionOrder;
import com.spindle.manage.exception.BusinessException;
import com.spindle.manage.mapper.InventoryLockRecordMapper;
import com.spindle.manage.mapper.InventoryOperationLogMapper;
import com.spindle.manage.mapper.MaterialInventoryMapper;
import com.spindle.manage.service.MaterialInventoryService;
import com.spindle.manage.service.ProductionOrderService;
import com.spindle.manage.utils.UserContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Random;

@Slf4j
@Service
@RequiredArgsConstructor
public class MaterialInventoryServiceImpl extends ServiceImpl<MaterialInventoryMapper, MaterialInventory> implements MaterialInventoryService {

    private final InventoryOperationLogMapper inventoryOperationLogMapper;
    private final InventoryLockRecordMapper inventoryLockRecordMapper;
    private final ProductionOrderService productionOrderService;

    @Override
    public IPage<MaterialInventory> getMaterialPage(Page<MaterialInventory> page, String materialName, String materialType, Integer inventoryStatus) {
        LambdaQueryWrapper<MaterialInventory> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(materialName)) {
            wrapper.like(MaterialInventory::getMaterialName, materialName);
        }
        if (StringUtils.hasText(materialType)) {
            wrapper.eq(MaterialInventory::getMaterialType, materialType);
        }
        if (inventoryStatus != null) {
            wrapper.eq(MaterialInventory::getInventoryStatus, inventoryStatus);
        }
        wrapper.orderByDesc(MaterialInventory::getCreateTime);
        return this.page(page, wrapper);
    }

    @Override
    public IPage<MaterialInventory> queryByConditions(Page<MaterialInventory> page, MaterialQueryDTO dto) {
        List<MaterialInventory> list = this.baseMapper.queryByConditions(dto);
        page.setRecords(list);
        page.setTotal(list.size());
        return page;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean addMaterial(MaterialInventory material) {
        material.setBatchNo(generateBatchNo());
        material.setTotalValue(material.getUnitPrice().multiply(material.getQuantity()));
        material.setInventoryStatus(1);
        boolean result = this.save(material);

        InventoryOperationLog log = new InventoryOperationLog();
        log.setMaterialId(material.getId());
        log.setBatchNo(material.getBatchNo());
        log.setOperationType("IN");
        log.setQuantity(material.getQuantity());
        log.setBeforeQuantity(BigDecimal.ZERO);
        log.setAfterQuantity(material.getQuantity());
        log.setOperatorId(UserContext.getUserId());
        log.setOperatorName(UserContext.getUsername());
        log.setRemark("初始入库");
        log.setCreateTime(LocalDateTime.now());
        inventoryOperationLogMapper.insert(log);

        checkInventoryStatus(material.getId());
        log.info("新增物料成功：{}", material.getMaterialName());
        return result;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean updateMaterial(MaterialInventory material) {
        if (material.getUnitPrice() != null && material.getQuantity() != null) {
            material.setTotalValue(material.getUnitPrice().multiply(material.getQuantity()));
        }
        boolean result = this.updateById(material);
        if (result && material.getQuantity() != null) {
            checkInventoryStatus(material.getId());
        }
        log.info("更新物料成功：{}", material.getId());
        return result;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean updateInventoryStatus(Long id, Integer status) {
        MaterialInventory material = new MaterialInventory();
        material.setId(id);
        material.setInventoryStatus(status);
        log.info("更新物料库存状态：id={}, status={}", id, status);
        return this.updateById(material);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean materialOut(MaterialOutDTO dto) {
        MaterialInventory material = this.getById(dto.getMaterialId());
        if (material == null) {
            throw new BusinessException("物料不存在");
        }

        BigDecimal availableQuantity = getAvailableQuantity(dto.getMaterialId());
        if (availableQuantity.compareTo(dto.getQuantity()) < 0) {
            throw new BusinessException("库存不足，可用库存：" + availableQuantity + "，申请出库：" + dto.getQuantity());
        }

        BigDecimal beforeQuantity = material.getQuantity();
        BigDecimal afterQuantity = beforeQuantity.subtract(dto.getQuantity());
        material.setQuantity(afterQuantity);
        material.setTotalValue(material.getUnitPrice().multiply(afterQuantity));
        this.updateById(material);

        ProductionOrder order = null;
        if (dto.getOrderId() != null) {
            order = productionOrderService.getById(dto.getOrderId());
        }

        InventoryOperationLog log = new InventoryOperationLog();
        log.setMaterialId(material.getId());
        log.setBatchNo(material.getBatchNo());
        log.setOperationType("OUT");
        log.setQuantity(dto.getQuantity());
        log.setBeforeQuantity(beforeQuantity);
        log.setAfterQuantity(afterQuantity);
        log.setOrderId(dto.getOrderId());
        log.setOrderNo(order != null ? order.getOrderNo() : null);
        log.setOperatorId(UserContext.getUserId());
        log.setOperatorName(UserContext.getUsername());
        log.setRemark(dto.getRemark());
        log.setCreateTime(LocalDateTime.now());
        inventoryOperationLogMapper.insert(log);

        if (dto.getOrderId() != null) {
            releaseInventory(dto.getOrderId(), dto.getMaterialId());
        }

        checkInventoryStatus(material.getId());
        log.info("物料出库成功：{}，数量：{}", material.getMaterialName(), dto.getQuantity());
        return true;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean materialIn(Long id, BigDecimal quantity, String remark) {
        MaterialInventory material = this.getById(id);
        if (material == null) {
            throw new BusinessException("物料不存在");
        }

        BigDecimal beforeQuantity = material.getQuantity();
        BigDecimal afterQuantity = beforeQuantity.add(quantity);
        material.setQuantity(afterQuantity);
        material.setTotalValue(material.getUnitPrice().multiply(afterQuantity));
        this.updateById(material);

        InventoryOperationLog log = new InventoryOperationLog();
        log.setMaterialId(material.getId());
        log.setBatchNo(material.getBatchNo());
        log.setOperationType("IN");
        log.setQuantity(quantity);
        log.setBeforeQuantity(beforeQuantity);
        log.setAfterQuantity(afterQuantity);
        log.setOperatorId(UserContext.getUserId());
        log.setOperatorName(UserContext.getUsername());
        log.setRemark(remark);
        log.setCreateTime(LocalDateTime.now());
        inventoryOperationLogMapper.insert(log);

        checkInventoryStatus(material.getId());
        log.info("物料入库成功：{}，数量：{}", material.getMaterialName(), quantity);
        return true;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean batchMaterialIn(List<MaterialOutDTO> list) {
        for (MaterialOutDTO dto : list) {
            materialIn(dto.getMaterialId(), dto.getQuantity(), dto.getRemark());
        }
        log.info("批量入库成功，共{}条", list.size());
        return true;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean batchMaterialOut(List<MaterialOutDTO> list) {
        for (MaterialOutDTO dto : list) {
            materialOut(dto);
        }
        log.info("批量出库成功，共{}条", list.size());
        return true;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean prepareMaterialForOrder(Long orderId) {
        ProductionOrder order = productionOrderService.getById(orderId);
        if (order == null) {
            throw new BusinessException("工单不存在");
        }

        if (order.getMaterialPrepareStatus() != null && order.getMaterialPrepareStatus() == 2) {
            throw new BusinessException("工单已备料，无需重复备料");
        }

        order.setMaterialPrepareStatus(1);
        productionOrderService.updateById(order);

        log.info("工单{}开始备料", order.getOrderNo());

        order.setMaterialPrepareStatus(2);
        productionOrderService.updateById(order);

        log.info("工单{}备料完成", order.getOrderNo());
        return true;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean lockInventory(Long orderId, Long materialId, BigDecimal quantity, String remark) {
        MaterialInventory material = this.getById(materialId);
        if (material == null) {
            throw new BusinessException("物料不存在");
        }

        BigDecimal availableQuantity = getAvailableQuantity(materialId);
        if (availableQuantity.compareTo(quantity) < 0) {
            throw new BusinessException("可用库存不足，可用库存：" + availableQuantity);
        }

        ProductionOrder order = productionOrderService.getById(orderId);
        if (order == null) {
            throw new BusinessException("工单不存在");
        }

        InventoryLockRecord lockRecord = new InventoryLockRecord();
        lockRecord.setOrderId(orderId);
        lockRecord.setOrderNo(order.getOrderNo());
        lockRecord.setMaterialId(materialId);
        lockRecord.setMaterialName(material.getMaterialName());
        lockRecord.setBatchNo(material.getBatchNo());
        lockRecord.setLockQuantity(quantity);
        lockRecord.setLockStatus(1);
        lockRecord.setLockTime(LocalDateTime.now());
        lockRecord.setOperatorId(UserContext.getUserId());
        lockRecord.setOperatorName(UserContext.getUsername());
        lockRecord.setRemark(remark);
        inventoryLockRecordMapper.insert(lockRecord);

        log.info("锁定库存成功：工单{}，物料{}，数量{}", order.getOrderNo(), material.getMaterialName(), quantity);
        return true;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean releaseInventory(Long orderId, Long materialId) {
        LambdaQueryWrapper<InventoryLockRecord> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(InventoryLockRecord::getOrderId, orderId)
                .eq(materialId != null, InventoryLockRecord::getMaterialId, materialId)
                .eq(InventoryLockRecord::getLockStatus, 1);
        List<InventoryLockRecord> lockRecords = inventoryLockRecordMapper.selectList(wrapper);

        for (InventoryLockRecord record : lockRecords) {
            record.setLockStatus(0);
            record.setReleaseTime(LocalDateTime.now());
            inventoryLockRecordMapper.updateById(record);
        }

        log.info("释放库存成功：工单{}，共{}条记录", orderId, lockRecords.size());
        return true;
    }

    @Override
    public BigDecimal getAvailableQuantity(Long materialId) {
        BigDecimal totalQuantity = this.baseMapper.getAvailableQuantity(materialId);
        BigDecimal lockedQuantity = inventoryLockRecordMapper.getLockedQuantityByMaterialId(materialId);
        return totalQuantity.subtract(lockedQuantity);
    }

    @Override
    public void checkStockWarning() {
        LambdaQueryWrapper<MaterialInventory> wrapper = new LambdaQueryWrapper<>();
        wrapper.isNotNull(MaterialInventory::getMinimumStock)
                .gt(MaterialInventory::getMinimumStock, 0)
                .apply("quantity <= minimum_stock");
        List<MaterialInventory> warningMaterials = this.list(wrapper);

        for (MaterialInventory material : warningMaterials) {
            if (material.getInventoryStatus() != 0) {
                material.setInventoryStatus(0);
                this.updateById(material);
                log.warn("物料{}库存低于安全库存，当前库存：{}，安全库存：{}",
                        material.getMaterialName(), material.getQuantity(), material.getMinimumStock());
            }
        }
    }

    @Override
    public void checkConstantTempExpire() {
        LambdaQueryWrapper<MaterialInventory> wrapper = new LambdaQueryWrapper<>();
        wrapper.isNotNull(MaterialInventory::getConstantTempExpireTime)
                .lt(MaterialInventory::getConstantTempExpireTime, LocalDateTime.now().plusDays(3));
        List<MaterialInventory> expiringMaterials = this.list(wrapper);

        for (MaterialInventory material : expiringMaterials) {
            log.warn("物料{}批次{}恒温仓储时效即将到期，到期时间：{}",
                    material.getMaterialName(), material.getBatchNo(), material.getConstantTempExpireTime());
        }
    }

    private void checkInventoryStatus(Long materialId) {
        MaterialInventory material = this.getById(materialId);
        if (material == null) {
            return;
        }

        if (material.getMinimumStock() != null && material.getMinimumStock().compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal availableQuantity = getAvailableQuantity(materialId);
            if (availableQuantity.compareTo(material.getMinimumStock()) <= 0) {
                if (material.getInventoryStatus() != 0) {
                    material.setInventoryStatus(0);
                    this.updateById(material);
                    log.warn("物料{}库存低于安全库存", material.getMaterialName());
                }
            } else {
                if (material.getInventoryStatus() == 0) {
                    material.setInventoryStatus(1);
                    this.updateById(material);
                    log.info("物料{}库存恢复正常", material.getMaterialName());
                }
            }
        }
    }

    private String generateBatchNo() {
        String dateStr = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        Random random = new Random();
        int randomNum = random.nextInt(10000);
        return "BATCH" + dateStr + String.format("%04d", randomNum);
    }

}
