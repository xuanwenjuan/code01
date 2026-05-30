package com.snacktrace.service;

import cn.hutool.core.util.IdUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.snacktrace.annotation.RequireRole;
import com.snacktrace.dto.MaterialInboundDTO;
import com.snacktrace.dto.MaterialQueryDTO;
import com.snacktrace.dto.MaterialUseDTO;
import com.snacktrace.entity.*;
import com.snacktrace.enums.BatchStatusEnum;
import com.snacktrace.enums.MaterialStatusEnum;
import com.snacktrace.enums.RoleEnum;
import com.snacktrace.exception.BusinessException;
import com.snacktrace.mapper.MaterialMapper;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class MaterialService extends ServiceImpl<MaterialMapper, Material> {

    @Autowired
    private MaterialBatchService batchService;

    @Autowired
    private MaterialStockFlowService stockFlowService;

    @Autowired
    private MaterialStockLockService stockLockService;

    @Autowired
    private UserService userService;

    public Page<Material> queryMaterialPage(MaterialQueryDTO queryDTO) {
        LambdaQueryWrapper<Material> wrapper = new LambdaQueryWrapper<>();

        if (queryDTO.getMaterialName() != null && !queryDTO.getMaterialName().isEmpty()) {
            wrapper.like(Material::getMaterialName, queryDTO.getMaterialName());
        }
        if (queryDTO.getMaterialType() != null) {
            wrapper.eq(Material::getMaterialType, queryDTO.getMaterialType());
        }
        if (queryDTO.getStatus() != null) {
            wrapper.eq(Material::getStatus, queryDTO.getStatus());
        }
        if (queryDTO.getSupplier() != null && !queryDTO.getSupplier().isEmpty()) {
            wrapper.like(Material::getSupplier, queryDTO.getSupplier());
        }
        if (queryDTO.getOrigin() != null && !queryDTO.getOrigin().isEmpty()) {
            wrapper.like(Material::getOrigin, queryDTO.getOrigin());
        }

        wrapper.orderByDesc(Material::getCreateTime);
        return page(new Page<>(queryDTO.getPage(), queryDTO.getSize()), wrapper);
    }

    @Transactional(rollbackFor = Exception.class)
    @RequireRole({RoleEnum.ADMIN, RoleEnum.PURCHASER})
    public boolean inboundMaterial(MaterialInboundDTO dto, Long operatorId, String operatorName) {
        Material material = getById(dto.getMaterialId());
        if (material == null) {
            throw new BusinessException("原料不存在");
        }

        String batchCode = "BATCH" + IdUtil.getSnowflakeNextIdStr();

        MaterialBatch batch = new MaterialBatch();
        batch.setMaterialId(dto.getMaterialId());
        batch.setBatchCode(batchCode);
        batch.setQuantity(dto.getQuantity());
        batch.setLockedQuantity(BigDecimal.ZERO);
        batch.setAvailableQuantity(dto.getQuantity());
        batch.setProductionDate(dto.getProductionDate());
        batch.setExpireDate(dto.getExpireDate());
        batch.setSupplier(dto.getSupplier());
        batch.setOrigin(material.getOrigin());
        batch.setInboundTime(LocalDateTime.now());
        batch.setStatus(BatchStatusEnum.IN_STOCK.getCode());
        batch.setCreateTime(LocalDateTime.now());

        boolean saved = batchService.save(batch);
        if (!saved) {
            throw new BusinessException("批次保存失败");
        }

        BigDecimal beforeQty = material.getQuantity();
        material.setQuantity(beforeQty.add(dto.getQuantity()));
        material.setAvailableQuantity(material.getQuantity().subtract(
                material.getLockedQuantity() != null ? material.getLockedQuantity() : BigDecimal.ZERO
        ));
        updateMaterialStatus(material);
        boolean updated = updateById(material);
        if (!updated) {
            throw new BusinessException("库存更新失败");
        }

        recordStockFlow(material.getId(), batch.getId(), null, 1,
                dto.getQuantity(), beforeQty, material.getQuantity(),
                "原料入库", dto.getRemark(), operatorId, operatorName);

        return true;
    }

    @Transactional(rollbackFor = Exception.class)
    public boolean lockStockForWorkOrder(Long workOrderId, Long materialId, Long batchId,
                                           BigDecimal quantity, Long operatorId, String operatorName) {
        Material material = getById(materialId);
        if (material == null) {
            throw new BusinessException("原料不存在");
        }

        MaterialBatch batch = batchService.getById(batchId);
        if (batch == null) {
            throw new BusinessException("原料批次不存在");
        }

        if (batch.getAvailableQuantity() == null) {
            batch.setAvailableQuantity(batch.getQuantity());
        }
        if (batch.getAvailableQuantity().compareTo(quantity) < 0) {
            throw new BusinessException("批次可用库存不足");
        }

        BigDecimal materialLockQty = material.getLockedQuantity() != null ?
                material.getLockedQuantity() : BigDecimal.ZERO;
        material.setLockedQuantity(materialLockQty.add(quantity));
        material.setAvailableQuantity(material.getQuantity().subtract(material.getLockedQuantity()));
        updateById(material);

        BigDecimal batchLockQty = batch.getLockedQuantity() != null ?
                batch.getLockedQuantity() : BigDecimal.ZERO;
        batch.setLockedQuantity(batchLockQty.add(quantity));
        batch.setAvailableQuantity(batch.getQuantity().subtract(batch.getLockedQuantity()));
        batchService.updateById(batch);

        return stockLockService.lockStock(workOrderId, materialId, batchId,
                quantity, operatorId, operatorName);
    }

    @Transactional(rollbackFor = Exception.class)
    public boolean releaseStockForWorkOrder(Long workOrderId) {
        List<MaterialStockLock> locks = stockLockService.getLocksByWorkOrderId(workOrderId);

        for (MaterialStockLock lock : locks) {
            if (lock.getLockStatus() == 1) {
                Material material = getById(lock.getMaterialId());
                if (material != null) {
                    BigDecimal lockQty = material.getLockedQuantity() != null ?
                            material.getLockedQuantity() : BigDecimal.ZERO;
                    material.setLockedQuantity(lockQty.subtract(lock.getLockQuantity()));
                    material.setAvailableQuantity(material.getQuantity().subtract(material.getLockedQuantity()));
                    updateById(material);
                }

                MaterialBatch batch = batchService.getById(lock.getBatchId());
                if (batch != null) {
                    BigDecimal batchLockQty = batch.getLockedQuantity() != null ?
                            batch.getLockedQuantity() : BigDecimal.ZERO;
                    batch.setLockedQuantity(batchLockQty.subtract(lock.getLockQuantity()));
                    batch.setAvailableQuantity(batch.getQuantity().subtract(batch.getLockedQuantity()));
                    batchService.updateById(batch);
                }
            }
        }

        return stockLockService.releaseStock(workOrderId);
    }

    @Transactional(rollbackFor = Exception.class)
    @RequireRole({RoleEnum.ADMIN, RoleEnum.TEAM_LEADER})
    public boolean useMaterial(MaterialUseDTO useDTO, Long operatorId, String operatorName) {
        Material material = getById(useDTO.getMaterialId());
        if (material == null) {
            throw new BusinessException("原料不存在");
        }

        MaterialBatch batch = batchService.getById(useDTO.getBatchId());
        if (batch == null) {
            throw new BusinessException("原料批次不存在");
        }

        if (!batch.getMaterialId().equals(useDTO.getMaterialId())) {
            throw new BusinessException("批次与原料不匹配");
        }

        if (batch.getStatus().equals(BatchStatusEnum.EXPIRED.getCode())) {
            throw new BusinessException("该批次原料已过期，不能使用");
        }

        BigDecimal beforeQty = material.getQuantity();
        if (beforeQty.compareTo(useDTO.getQuantity()) < 0) {
            throw new BusinessException("库存不足，当前库存：" + beforeQty);
        }

        material.setQuantity(beforeQty.subtract(useDTO.getQuantity()));
        if (material.getLockedQuantity() != null && material.getLockedQuantity().compareTo(useDTO.getQuantity()) >= 0) {
            material.setLockedQuantity(material.getLockedQuantity().subtract(useDTO.getQuantity()));
        }
        material.setAvailableQuantity(material.getQuantity().subtract(
                material.getLockedQuantity() != null ? material.getLockedQuantity() : BigDecimal.ZERO
        ));
        updateMaterialStatus(material);
        updateById(material);

        BigDecimal batchBeforeQty = batch.getQuantity();
        batch.setQuantity(batchBeforeQty.subtract(useDTO.getQuantity()));
        if (batch.getLockedQuantity() != null && batch.getLockedQuantity().compareTo(useDTO.getQuantity()) >= 0) {
            batch.setLockedQuantity(batch.getLockedQuantity().subtract(useDTO.getQuantity()));
        }
        batch.setAvailableQuantity(batch.getQuantity().subtract(
                batch.getLockedQuantity() != null ? batch.getLockedQuantity() : BigDecimal.ZERO
        ));
        if (batch.getQuantity().compareTo(BigDecimal.ZERO) <= 0) {
            batch.setStatus(BatchStatusEnum.USED_UP.getCode());
        } else {
            batch.setStatus(BatchStatusEnum.IN_USE.getCode());
        }
        batchService.updateById(batch);

        if (useDTO.getWorkOrderId() != null) {
            stockLockService.confirmUseStock(useDTO.getWorkOrderId());
        }

        recordStockFlow(material.getId(), batch.getId(), useDTO.getWorkOrderId(), 2,
                useDTO.getQuantity(), beforeQty, material.getQuantity(),
                "工单领料", useDTO.getRemark(), operatorId, operatorName);

        return true;
    }

    @Transactional(rollbackFor = Exception.class)
    @RequireRole({RoleEnum.ADMIN, RoleEnum.QC_INSPECTOR})
    public boolean handleDefectiveMaterial(Long materialId, Long batchId, BigDecimal quantity,
                                            String reason, Long operatorId, String operatorName) {
        Material material = getById(materialId);
        if (material == null) {
            throw new BusinessException("原料不存在");
        }

        MaterialBatch batch = batchService.getById(batchId);
        if (batch == null) {
            throw new BusinessException("原料批次不存在");
        }

        BigDecimal beforeQty = material.getQuantity();
        material.setQuantity(beforeQty.subtract(quantity));
        updateMaterialStatus(material);
        updateById(material);

        batch.setQuantity(batch.getQuantity().subtract(quantity));
        batchService.updateById(batch);

        recordStockFlow(materialId, batchId, null, 4,
                quantity, beforeQty, material.getQuantity(),
                "次品处理", reason, operatorId, operatorName);

        return true;
    }

    private void updateMaterialStatus(Material material) {
        if (material.getQuantity().compareTo(BigDecimal.ZERO) <= 0) {
            material.setStatus(MaterialStatusEnum.SUSPEND.getCode());
        } else if (material.getQuantity().compareTo(material.getWarningQuantity()) <= 0) {
            material.setStatus(MaterialStatusEnum.WARNING.getCode());
        } else {
            material.setStatus(MaterialStatusEnum.SUFFICIENT.getCode());
        }
    }

    public Page<MaterialBatch> queryBatchPage(Long materialId, Integer status, String origin,
                                                int page, int size) {
        LambdaQueryWrapper<MaterialBatch> wrapper = new LambdaQueryWrapper<>();
        if (materialId != null) {
            wrapper.eq(MaterialBatch::getMaterialId, materialId);
        }
        if (status != null) {
            wrapper.eq(MaterialBatch::getStatus, status);
        }
        if (origin != null && !origin.isEmpty()) {
            wrapper.like(MaterialBatch::getOrigin, origin);
        }
        wrapper.orderByDesc(MaterialBatch::getInboundTime);
        return batchService.page(new Page<>(page, size), wrapper);
    }

    private void recordStockFlow(Long materialId, Long batchId, Long workOrderId,
                                  Integer flowType, BigDecimal quantity,
                                  BigDecimal beforeQuantity, BigDecimal afterQuantity,
                                  String operation, String remark,
                                  Long operatorId, String operatorName) {
        MaterialStockFlow flow = new MaterialStockFlow();
        flow.setMaterialId(materialId);
        flow.setBatchId(batchId);
        flow.setWorkOrderId(workOrderId);
        flow.setFlowType(flowType);
        flow.setQuantity(quantity);
        flow.setBeforeQuantity(beforeQuantity);
        flow.setAfterQuantity(afterQuantity);
        flow.setRemark(remark);
        flow.setOperatorId(operatorId);
        flow.setOperatorName(operatorName);
        flow.setCreateTime(LocalDateTime.now());
        stockFlowService.save(flow);
    }

    public Page<MaterialStockFlow> queryStockFlowPage(Long materialId, Long workOrderId,
                                                        int page, int size) {
        LambdaQueryWrapper<MaterialStockFlow> wrapper = new LambdaQueryWrapper<>();
        if (materialId != null) {
            wrapper.eq(MaterialStockFlow::getMaterialId, materialId);
        }
        if (workOrderId != null) {
            wrapper.eq(MaterialStockFlow::getWorkOrderId, workOrderId);
        }
        wrapper.orderByDesc(MaterialStockFlow::getCreateTime);
        return stockFlowService.page(new Page<>(page, size), wrapper);
    }
}
