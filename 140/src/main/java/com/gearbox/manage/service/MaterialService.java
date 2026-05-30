package com.gearbox.manage.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.gearbox.manage.context.UserContext;
import com.gearbox.manage.dto.MaterialQueryDTO;
import com.gearbox.manage.dto.PickMaterialDTO;
import com.gearbox.manage.entity.Material;
import com.gearbox.manage.entity.MaterialBatch;
import com.gearbox.manage.entity.WorkOrderMaterial;
import com.gearbox.manage.exception.BusinessException;
import com.gearbox.manage.mapper.MaterialMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MaterialService extends ServiceImpl<MaterialMapper, Material> {

    private final MaterialBatchService materialBatchService;
    private final WorkOrderMaterialService workOrderMaterialService;

    @Cacheable(value = "materialList", key = "#type", unless = "#result == null or #result.size() == 0")
    public List<Material> listByType(String type) {
        return lambdaQuery()
                .eq(Material::getMaterialType, type)
                .list();
    }

    public IPage<Material> queryPage(int pageNum, int pageSize, MaterialQueryDTO dto) {
        Page<Material> page = new Page<>(pageNum, pageSize);
        return baseMapper.queryByConditions(page, dto);
    }

    public Page<Material> listPage(int pageNum, int pageSize, String materialType, String status) {
        Page<Material> page = new Page<>(pageNum, pageSize);
        return lambdaQuery()
                .eq(materialType != null && !materialType.isEmpty(), Material::getMaterialType, materialType)
                .eq(status != null && !status.isEmpty(), Material::getStatus, status)
                .orderByDesc(Material::getCreateTime)
                .page(page);
    }

    public List<Material> listByStatus(String status) {
        return lambdaQuery()
                .eq(Material::getStatus, status)
                .list();
    }

    @Transactional(rollbackFor = Exception.class)
    @CacheEvict(value = "materialList", allEntries = true)
    public boolean add(Material material) {
        material.setStatus("SUFFICIENT");
        if (material.getQuantity() == null) {
            material.setQuantity(BigDecimal.ZERO);
        }
        return save(material);
    }

    @Transactional(rollbackFor = Exception.class)
    @CacheEvict(value = "materialList", allEntries = true)
    public boolean updateMaterial(Material material) {
        Material old = getById(material.getId());
        if (old == null) {
            throw new BusinessException("物料不存在");
        }
        boolean result = updateById(material);
        if (result) {
            updateMaterialStatus(material);
        }
        return result;
    }

    @Transactional(rollbackFor = Exception.class)
    @CacheEvict(value = "materialList", allEntries = true)
    public boolean stockIn(Long materialId, BigDecimal quantity, String warehouseLocation) {
        Material material = getById(materialId);
        if (material == null) {
            throw new BusinessException("物料不存在");
        }

        material.setQuantity(material.getQuantity().add(quantity));
        updateById(material);

        updateMaterialStatus(material);

        MaterialBatch batch = new MaterialBatch();
        batch.setMaterialId(materialId);
        batch.setBatchCode(generateBatchCode(materialId));
        batch.setQuantity(quantity);
        batch.setUsedQuantity(BigDecimal.ZERO);
        batch.setInboundDate(LocalDate.now());
        batch.setWarehouseLocation(warehouseLocation);
        batch.setStatus("NORMAL");

        if (material.getIsEasyOxidize() == 1) {
            batch.setExpirationDate(LocalDate.now().plusDays(material.getRustproofDays()));
        }

        return materialBatchService.save(batch);
    }

    @Transactional(rollbackFor = Exception.class)
    @CacheEvict(value = "materialList", allEntries = true)
    public boolean pickMaterial(PickMaterialDTO dto) {
        WorkOrderMaterial wom = workOrderMaterialService.getById(dto.getWorkOrderMaterialId());
        if (wom == null) {
            throw new BusinessException("工单物料不存在");
        }

        if ("PICKED".equals(wom.getStatus())) {
            throw new BusinessException("该物料已完成领料，不可重复领料");
        }

        MaterialBatch batch = materialBatchService.getById(dto.getBatchId());
        if (batch == null) {
            throw new BusinessException("批次不存在");
        }

        if (!"NORMAL".equals(batch.getStatus()) && !"EXPIRING".equals(batch.getStatus())) {
            throw new BusinessException("该批次状态不可用");
        }

        BigDecimal availableQuantity = batch.getQuantity().subtract(batch.getUsedQuantity());
        if (availableQuantity.compareTo(dto.getQuantity()) < 0) {
            throw new BusinessException("该批次可用库存不足，当前可用：" + availableQuantity);
        }

        BigDecimal totalActual = wom.getActualQuantity() != null ? wom.getActualQuantity() : BigDecimal.ZERO;
        BigDecimal newActual = totalActual.add(dto.getQuantity());

        if (newActual.compareTo(wom.getRequiredQuantity()) > 0) {
            throw new BusinessException("领料数量不能超过需求数量，最大可领：" + wom.getRequiredQuantity().subtract(totalActual));
        }

        batch.setUsedQuantity(batch.getUsedQuantity().add(dto.getQuantity()));
        if (batch.getQuantity().compareTo(batch.getUsedQuantity()) <= 0) {
            batch.setStatus("USED_UP");
        }
        materialBatchService.updateById(batch);

        Material material = getById(wom.getMaterialId());
        if (material != null) {
            material.setQuantity(material.getQuantity().subtract(dto.getQuantity()));
            updateMaterialStatus(material);
            updateById(material);
        }

        wom.setBatchId(dto.getBatchId());
        wom.setActualQuantity(newActual);
        wom.setUnitPrice(material != null ? material.getUnitPrice() : BigDecimal.ZERO);
        wom.setTotalPrice(newActual.multiply(wom.getUnitPrice()));
        wom.setStatus("PICKED");
        wom.setPickTime(java.time.LocalDateTime.now());
        wom.setPickUserId(UserContext.getUserId());
        workOrderMaterialService.updateById(wom);

        return true;
    }

    @Transactional(rollbackFor = Exception.class)
    public boolean lockMaterial(Long workOrderId) {
        List<WorkOrderMaterial> materials = workOrderMaterialService.lambdaQuery()
                .eq(WorkOrderMaterial::getWorkOrderId, workOrderId)
                .list();

        for (WorkOrderMaterial wom : materials) {
            Material material = getById(wom.getMaterialId());
            if (material == null) {
                continue;
            }

            if (material.getQuantity().compareTo(wom.getRequiredQuantity()) < 0) {
                throw new BusinessException("物料【" + material.getMaterialName() + "】库存不足，无法锁定");
            }
        }

        for (WorkOrderMaterial wom : materials) {
            wom.setStatus("LOCKED");
            workOrderMaterialService.updateById(wom);
        }

        return true;
    }

    @Transactional(rollbackFor = Exception.class)
    @CacheEvict(value = "materialList", allEntries = true)
    public boolean batchStockIn(List<MaterialBatch> batches) {
        for (MaterialBatch batch : batches) {
            stockIn(batch.getMaterialId(), batch.getQuantity(), batch.getWarehouseLocation());
        }
        return true;
    }

    private void updateMaterialStatus(Material material) {
        String newStatus;
        if (material.getQuantity().compareTo(BigDecimal.ZERO) <= 0) {
            newStatus = "STOP";
        } else if (material.getQuantity().compareTo(material.getWarningQuantity()) <= 0) {
            newStatus = "WARNING";
        } else {
            newStatus = "SUFFICIENT";
        }
        if (!newStatus.equals(material.getStatus())) {
            material.setStatus(newStatus);
            updateById(material);
        }
    }

    private String generateBatchCode(Long materialId) {
        String date = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        long count = materialBatchService.count(
            new LambdaQueryWrapper<MaterialBatch>()
                .likeRight(MaterialBatch::getBatchCode, date)
        );
        return "BATCH" + date + String.format("%04d", count + 1);
    }

    public List<MaterialBatch> getBatchesByMaterialId(Long materialId) {
        return materialBatchService.lambdaQuery()
                .eq(MaterialBatch::getMaterialId, materialId)
                .orderByDesc(MaterialBatch::getInboundDate)
                .list();
    }

    public List<MaterialBatch> getAvailableBatches(Long materialId) {
        return materialBatchService.lambdaQuery()
                .eq(MaterialBatch::getMaterialId, materialId)
                .in(MaterialBatch::getStatus, "NORMAL", "EXPIRING")
                .apply("quantity - used_quantity > 0")
                .orderByAsc(MaterialBatch::getInboundDate)
                .list();
    }

    @Transactional(rollbackFor = Exception.class)
    @CacheEvict(value = "materialList", allEntries = true)
    public boolean deleteMaterial(Long id) {
        Material material = getById(id);
        if (material == null) {
            throw new BusinessException("物料不存在");
        }
        return removeById(id);
    }
}
