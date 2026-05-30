package com.paper.production.service.material.impl;

import cn.hutool.core.util.StrUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.paper.production.common.PageQuery;
import com.paper.production.common.PageResult;
import com.paper.production.common.ResultCode;
import com.paper.production.dto.material.MaterialDTO;
import com.paper.production.dto.material.MaterialInboundDTO;
import com.paper.production.dto.material.MaterialOutboundDTO;
import com.paper.production.dto.material.MaterialQueryDTO;
import com.paper.production.entity.material.Material;
import com.paper.production.entity.material.MaterialBatch;
import com.paper.production.entity.material.MaterialInbound;
import com.paper.production.entity.material.MaterialOutbound;
import com.paper.production.entity.material.MaterialStockLock;
import com.paper.production.entity.workorder.WorkOrder;
import com.paper.production.enums.WorkOrderStatusEnum;
import com.paper.production.mapper.material.MaterialStockLockMapper;
import com.paper.production.mapper.workorder.WorkOrderMapper;
import com.paper.production.enums.MaterialStatusEnum;
import com.paper.production.exception.BusinessException;
import com.paper.production.mapper.material.MaterialBatchMapper;
import com.paper.production.mapper.material.MaterialInboundMapper;
import com.paper.production.mapper.material.MaterialMapper;
import com.paper.production.mapper.material.MaterialOutboundMapper;
import com.paper.production.service.material.MaterialService;
import com.paper.production.utils.UserContextUtil;
import jakarta.annotation.Resource;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@Service
public class MaterialServiceImpl extends ServiceImpl<MaterialMapper, Material> implements MaterialService {

    @Resource
    private MaterialBatchMapper materialBatchMapper;

    @Resource
    private MaterialInboundMapper materialInboundMapper;

    @Resource
    private MaterialOutboundMapper materialOutboundMapper;

    @Resource
    private MaterialStockLockMapper materialStockLockMapper;

    @Resource
    private WorkOrderMapper workOrderMapper;

    @Override
    public void saveMaterial(MaterialDTO dto) {
        LambdaQueryWrapper<Material> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Material::getMaterialCode, dto.getMaterialCode());
        if (count(wrapper) > 0) {
            throw new BusinessException(ResultCode.DATA_ALREADY_EXIST.getCode(), "物料编码已存在");
        }

        Material material = new Material();
        BeanUtils.copyProperties(dto, material);
        if (material.getStatus() == null) {
            material.setStatus(MaterialStatusEnum.NORMAL.getCode());
        }
        if (material.getMoistureProof() == null) {
            material.setMoistureProof(false);
        }
        save(material);
    }

    @Override
    public void updateMaterial(MaterialDTO dto) {
        if (dto.getId() == null) {
            throw new BusinessException(ResultCode.PARAM_ERROR.getCode(), "ID不能为空");
        }
        Material material = getById(dto.getId());
        if (material == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }

        LambdaQueryWrapper<Material> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Material::getMaterialCode, dto.getMaterialCode());
        wrapper.ne(Material::getId, dto.getId());
        if (count(wrapper) > 0) {
            throw new BusinessException(ResultCode.DATA_ALREADY_EXIST.getCode(), "物料编码已存在");
        }

        BeanUtils.copyProperties(dto, material);
        updateById(material);
    }

    @Override
    public void deleteMaterial(Long id) {
        Material material = getById(id);
        if (material == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }

        LambdaQueryWrapper<MaterialBatch> batchWrapper = new LambdaQueryWrapper<>();
        batchWrapper.eq(MaterialBatch::getMaterialId, id);
        if (materialBatchMapper.selectCount(batchWrapper) > 0) {
            throw new BusinessException(ResultCode.DATA_CANNOT_DELETE.getCode(), "存在批次记录，无法删除");
        }

        removeById(id);
    }

    @Override
    public PageResult<Material> queryMaterialPage(PageQuery query) {
        LambdaQueryWrapper<Material> wrapper = new LambdaQueryWrapper<>();
        if (StrUtil.isNotBlank(query.getKeyword())) {
            wrapper.and(w -> w.like(Material::getMaterialCode, query.getKeyword())
                    .or().like(Material::getMaterialName, query.getKeyword()));
        }
        wrapper.orderByDesc(Material::getCreateTime);

        Page<Material> page = page(new Page<>(query.getCurrent(), query.getSize()), wrapper);
        return PageResult.of(page.getTotal(), page.getPages(), page.getCurrent(), page.getSize(), page.getRecords());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void inbound(MaterialInboundDTO dto) {
        Material material = getById(dto.getMaterialId());
        if (material == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST.getCode(), "物料不存在");
        }

        String batchNo = generateBatchNo(material.getMaterialCode());

        MaterialBatch batch = new MaterialBatch();
        batch.setBatchNo(batchNo);
        batch.setMaterialId(material.getId());
        batch.setMaterialCode(material.getMaterialCode());
        batch.setMaterialName(material.getMaterialName());
        batch.setQuantity(dto.getQuantity());
        batch.setUnitPrice(dto.getUnitPrice());
        batch.setProductionDate(dto.getProductionDate());
        batch.setExpiryDate(dto.getExpiryDate());
        batch.setInboundTime(LocalDateTime.now());
        batch.setSupplier(dto.getSupplier() != null ? dto.getSupplier() : material.getSupplier());
        batch.setStorageLocation(dto.getStorageLocation() != null ? dto.getStorageLocation() : material.getStorageLocation());
        batch.setStatus(1);
        batch.setRemark(dto.getRemark());
        materialBatchMapper.insert(batch);

        MaterialInbound inbound = new MaterialInbound();
        inbound.setInboundNo(generateInboundNo());
        inbound.setMaterialId(material.getId());
        inbound.setMaterialCode(material.getMaterialCode());
        inbound.setMaterialName(material.getMaterialName());
        inbound.setBatchNo(batchNo);
        inbound.setQuantity(dto.getQuantity());
        inbound.setUnitPrice(dto.getUnitPrice());
        inbound.setTotalPrice(dto.getQuantity().multiply(dto.getUnitPrice()));
        inbound.setSupplier(dto.getSupplier() != null ? dto.getSupplier() : material.getSupplier());
        inbound.setInboundTime(LocalDateTime.now());
        inbound.setStorageLocation(dto.getStorageLocation() != null ? dto.getStorageLocation() : material.getStorageLocation());
        inbound.setOperator(UserContextUtil.getUsername());
        inbound.setStatus(1);
        inbound.setRemark(dto.getRemark());
        materialInboundMapper.insert(inbound);

        material.setStockQuantity(material.getStockQuantity().add(dto.getQuantity()));
        updateMaterialStatus(material);
        updateById(material);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void outbound(MaterialOutboundDTO dto) {
        Material material = getById(dto.getMaterialId());
        if (material == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST.getCode(), "物料不存在");
        }

        LambdaQueryWrapper<MaterialBatch> batchWrapper = new LambdaQueryWrapper<>();
        batchWrapper.eq(MaterialBatch::getBatchNo, dto.getBatchNo());
        batchWrapper.eq(MaterialBatch::getMaterialId, dto.getMaterialId());
        MaterialBatch batch = materialBatchMapper.selectOne(batchWrapper);
        if (batch == null) {
            throw new BusinessException(ResultCode.BATCH_NOT_EXIST);
        }

        if (batch.getQuantity().compareTo(dto.getQuantity()) < 0) {
            throw new BusinessException(ResultCode.STOCK_INSUFFICIENT.getCode(), "批次库存不足");
        }

        if (material.getStockQuantity().compareTo(dto.getQuantity()) < 0) {
            throw new BusinessException(ResultCode.STOCK_INSUFFICIENT);
        }

        batch.setQuantity(batch.getQuantity().subtract(dto.getQuantity()));
        if (batch.getQuantity().compareTo(BigDecimal.ZERO) == 0) {
            batch.setStatus(0);
        }
        materialBatchMapper.updateById(batch);

        MaterialOutbound outbound = new MaterialOutbound();
        outbound.setOutboundNo(generateOutboundNo());
        outbound.setMaterialId(material.getId());
        outbound.setMaterialCode(material.getMaterialCode());
        outbound.setMaterialName(material.getMaterialName());
        outbound.setBatchNo(dto.getBatchNo());
        outbound.setQuantity(dto.getQuantity());
        outbound.setUnitPrice(batch.getUnitPrice());
        outbound.setTotalPrice(dto.getQuantity().multiply(batch.getUnitPrice()));
        outbound.setWorkOrderNo(dto.getWorkOrderNo());
        outbound.setReceiver(dto.getReceiver());
        outbound.setOutboundTime(LocalDateTime.now());
        outbound.setOperator(UserContextUtil.getUsername());
        outbound.setStatus(1);
        outbound.setRemark(dto.getRemark());
        materialOutboundMapper.insert(outbound);

        material.setStockQuantity(material.getStockQuantity().subtract(dto.getQuantity()));
        updateMaterialStatus(material);
        updateById(material);
    }

    @Override
    public List<MaterialBatch> getMaterialBatches(Long materialId) {
        LambdaQueryWrapper<MaterialBatch> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(MaterialBatch::getMaterialId, materialId);
        wrapper.orderByDesc(MaterialBatch::getInboundTime);
        return materialBatchMapper.selectList(wrapper);
    }

    @Override
    public void updateStatus(Long id, Integer status) {
        Material material = getById(id);
        if (material == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }
        material.setStatus(status);
        updateById(material);
    }

    @Override
    public void checkStockWarning() {
        List<Material> materials = list();
        for (Material material : materials) {
            updateMaterialStatus(material);
            updateById(material);
        }
    }

    private void updateMaterialStatus(Material material) {
        if (material.getMinStock() != null && material.getStockQuantity().compareTo(material.getMinStock()) < 0) {
            material.setStatus(MaterialStatusEnum.WARNING.getCode());
        } else if (material.getMaxStock() != null && material.getStockQuantity().compareTo(material.getMaxStock()) > 0) {
            material.setStatus(MaterialStatusEnum.SUSPEND.getCode());
        } else {
            material.setStatus(MaterialStatusEnum.NORMAL.getCode());
        }
    }

    private String generateBatchNo(String materialCode) {
        String date = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        int count = materialBatchMapper.selectCount(new LambdaQueryWrapper<MaterialBatch>()
                .likeRight(MaterialBatch::getBatchNo, "BATCH-" + materialCode + "-" + date)) + 1;
        return String.format("BATCH-%s-%s-%04d", materialCode, date, count);
    }

    private String generateInboundNo() {
        String date = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        int count = materialInboundMapper.selectCount(new LambdaQueryWrapper<MaterialInbound>()
                .likeRight(MaterialInbound::getInboundNo, "IN-" + date)) + 1;
        return String.format("IN-%s-%04d", date, count);
    }

    private String generateOutboundNo() {
        String date = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        int count = materialOutboundMapper.selectCount(new LambdaQueryWrapper<MaterialOutbound>()
                .likeRight(MaterialOutbound::getOutboundNo, "OUT-" + date)) + 1;
        return String.format("OUT-%s-%04d", date, count);
    }

    @Override
    public List<Material> getWarningMaterials() {
        LambdaQueryWrapper<Material> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Material::getStatus, MaterialStatusEnum.WARNING.getCode());
        wrapper.orderByDesc(Material::getCreateTime);
        return list(wrapper);
    }

    @Override
    public List<Material> getMoistureProofExpiring() {
        LocalDate today = LocalDate.now();
        LocalDate warnDate = today.plusDays(7);
        LambdaQueryWrapper<Material> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Material::getMoistureProof, true);
        wrapper.isNotNull(Material::getExpiryDate);
        wrapper.ge(Material::getExpiryDate, today);
        wrapper.le(Material::getExpiryDate, warnDate);
        wrapper.orderByAsc(Material::getExpiryDate);
        return list(wrapper);
    }

    @Override
    public PageResult<MaterialInbound> queryInboundPage(PageQuery query) {
        LambdaQueryWrapper<MaterialInbound> wrapper = new LambdaQueryWrapper<>();
        if (StrUtil.isNotBlank(query.getKeyword())) {
            wrapper.and(w -> w.like(MaterialInbound::getInboundNo, query.getKeyword())
                    .or().like(MaterialInbound::getMaterialName, query.getKeyword())
                    .or().like(MaterialInbound::getMaterialCode, query.getKeyword()));
        }
        wrapper.orderByDesc(MaterialInbound::getInboundTime);

        Page<MaterialInbound> page = new Page<>(query.getCurrent(), query.getSize());
        materialInboundMapper.selectPage(page, wrapper);
        return PageResult.of(page.getTotal(), page.getPages(), page.getCurrent(), page.getSize(), page.getRecords());
    }

    @Override
    public PageResult<MaterialOutbound> queryOutboundPage(PageQuery query) {
        LambdaQueryWrapper<MaterialOutbound> wrapper = new LambdaQueryWrapper<>();
        if (StrUtil.isNotBlank(query.getKeyword())) {
            wrapper.and(w -> w.like(MaterialOutbound::getOutboundNo, query.getKeyword())
                    .or().like(MaterialOutbound::getMaterialName, query.getKeyword())
                    .or().like(MaterialOutbound::getMaterialCode, query.getKeyword())
                    .or().like(MaterialOutbound::getWorkOrderNo, query.getKeyword()));
        }
        wrapper.orderByDesc(MaterialOutbound::getOutboundTime);

        Page<MaterialOutbound> page = new Page<>(query.getCurrent(), query.getSize());
        materialOutboundMapper.selectPage(page, wrapper);
        return PageResult.of(page.getTotal(), page.getPages(), page.getCurrent(), page.getSize(), page.getRecords());
    }

    @Override
    public Map<String, Object> getMaterialStatistics() {
        Map<String, Object> result = new java.util.HashMap<>();

        long totalCount = count();
        long warningCount = count(new LambdaQueryWrapper<Material>()
                .eq(Material::getStatus, MaterialStatusEnum.WARNING.getCode()));
        long suspendCount = count(new LambdaQueryWrapper<Material>()
                .eq(Material::getStatus, MaterialStatusEnum.SUSPEND.getCode()));
        long normalCount = totalCount - warningCount - suspendCount;

        BigDecimal totalStockValue = BigDecimal.ZERO;
        List<Material> materials = list();
        for (Material material : materials) {
            if (material.getStockQuantity() != null && material.getUnitPrice() != null) {
                totalStockValue = totalStockValue.add(material.getStockQuantity().multiply(material.getUnitPrice()));
            }
        }

        result.put("totalCount", totalCount);
        result.put("normalCount", normalCount);
        result.put("warningCount", warningCount);
        result.put("suspendCount", suspendCount);
        result.put("totalStockValue", totalStockValue);

        return result;
    }

    @Override
    public List<Material> listByType(String materialType) {
        LambdaQueryWrapper<Material> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Material::getMaterialType, materialType);
        wrapper.eq(Material::getStatus, MaterialStatusEnum.NORMAL.getCode());
        wrapper.orderByAsc(Material::getMaterialName);
        return list(wrapper);
    }

    @Override
    public List<MaterialBatch> getBatchList() {
        LambdaQueryWrapper<MaterialBatch> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(MaterialBatch::getStatus, 1);
        wrapper.orderByDesc(MaterialBatch::getInboundTime);
        return materialBatchMapper.selectList(wrapper);
    }

    @Override
    public PageResult<MaterialBatch> queryBatchPage(PageQuery query) {
        LambdaQueryWrapper<MaterialBatch> wrapper = new LambdaQueryWrapper<>();
        if (StrUtil.isNotBlank(query.getKeyword())) {
            wrapper.and(w -> w.like(MaterialBatch::getBatchNo, query.getKeyword())
                    .or().like(MaterialBatch::getMaterialName, query.getKeyword())
                    .or().like(MaterialBatch::getMaterialCode, query.getKeyword()));
        }
        wrapper.orderByDesc(MaterialBatch::getInboundTime);

        Page<MaterialBatch> page = new Page<>(query.getCurrent(), query.getSize());
        materialBatchMapper.selectPage(page, wrapper);
        return PageResult.of(page.getTotal(), page.getPages(), page.getCurrent(), page.getSize(), page.getRecords());
    }

    @Override
    public Map<String, Object> getInboundStatistics(LocalDate startDate, LocalDate endDate) {
        Map<String, Object> result = new java.util.HashMap<>();

        LambdaQueryWrapper<MaterialInbound> wrapper = new LambdaQueryWrapper<>();
        if (startDate != null) {
            wrapper.ge(MaterialInbound::getInboundTime, startDate.atStartOfDay());
        }
        if (endDate != null) {
            wrapper.le(MaterialInbound::getInboundTime, endDate.atTime(23, 59, 59));
        }

        List<MaterialInbound> inbounds = materialInboundMapper.selectList(wrapper);
        BigDecimal totalAmount = BigDecimal.ZERO;
        BigDecimal totalQuantity = BigDecimal.ZERO;

        for (MaterialInbound inbound : inbounds) {
            if (inbound.getTotalPrice() != null) {
                totalAmount = totalAmount.add(inbound.getTotalPrice());
            }
            if (inbound.getQuantity() != null) {
                totalQuantity = totalQuantity.add(inbound.getQuantity());
            }
        }

        result.put("totalCount", inbounds.size());
        result.put("totalAmount", totalAmount);
        result.put("totalQuantity", totalQuantity);

        return result;
    }

    @Override
    public Map<String, Object> getOutboundStatistics(LocalDate startDate, LocalDate endDate) {
        Map<String, Object> result = new java.util.HashMap<>();

        LambdaQueryWrapper<MaterialOutbound> wrapper = new LambdaQueryWrapper<>();
        if (startDate != null) {
            wrapper.ge(MaterialOutbound::getOutboundTime, startDate.atStartOfDay());
        }
        if (endDate != null) {
            wrapper.le(MaterialOutbound::getOutboundTime, endDate.atTime(23, 59, 59));
        }

        List<MaterialOutbound> outbounds = materialOutboundMapper.selectList(wrapper);
        BigDecimal totalAmount = BigDecimal.ZERO;
        BigDecimal totalQuantity = BigDecimal.ZERO;

        for (MaterialOutbound outbound : outbounds) {
            if (outbound.getTotalPrice() != null) {
                totalAmount = totalAmount.add(outbound.getTotalPrice());
            }
            if (outbound.getQuantity() != null) {
                totalQuantity = totalQuantity.add(outbound.getQuantity());
            }
        }

        result.put("totalCount", outbounds.size());
        result.put("totalAmount", totalAmount);
        result.put("totalQuantity", totalQuantity);

        return result;
    }

    @Override
    public PageResult<Material> queryMaterialByConditions(MaterialQueryDTO query) {
        LambdaQueryWrapper<Material> wrapper = new LambdaQueryWrapper<>();

        if (StrUtil.isNotBlank(query.getKeyword())) {
            wrapper.and(w -> w.like(Material::getMaterialCode, query.getKeyword())
                    .or().like(Material::getMaterialName, query.getKeyword())
                    .or().like(Material::getSpecification, query.getKeyword()));
        }
        if (StrUtil.isNotBlank(query.getMaterialCode())) {
            wrapper.eq(Material::getMaterialCode, query.getMaterialCode());
        }
        if (StrUtil.isNotBlank(query.getMaterialName())) {
            wrapper.like(Material::getMaterialName, query.getMaterialName());
        }
        if (StrUtil.isNotBlank(query.getMaterialType())) {
            wrapper.eq(Material::getMaterialType, query.getMaterialType());
        }
        if (StrUtil.isNotBlank(query.getSpecification())) {
            wrapper.like(Material::getSpecification, query.getSpecification());
        }
        if (query.getStatus() != null) {
            wrapper.eq(Material::getStatus, query.getStatus());
        }
        if (query.getStockQuantityMin() != null) {
            wrapper.ge(Material::getStockQuantity, query.getStockQuantityMin());
        }
        if (query.getStockQuantityMax() != null) {
            wrapper.le(Material::getStockQuantity, query.getStockQuantityMax());
        }
        if (query.getUnitPriceMin() != null) {
            wrapper.ge(Material::getUnitPrice, query.getUnitPriceMin());
        }
        if (query.getUnitPriceMax() != null) {
            wrapper.le(Material::getUnitPrice, query.getUnitPriceMax());
        }
        if (query.getMoistureProof() != null) {
            wrapper.eq(Material::getMoistureProof, query.getMoistureProof());
        }
        if (StrUtil.isNotBlank(query.getSupplier())) {
            wrapper.like(Material::getSupplier, query.getSupplier());
        }
        if (StrUtil.isNotBlank(query.getStorageLocation())) {
            wrapper.like(Material::getStorageLocation, query.getStorageLocation());
        }
        if (query.getStartTime() != null) {
            wrapper.ge(Material::getCreateTime, query.getStartTime());
        }
        if (query.getEndTime() != null) {
            wrapper.le(Material::getCreateTime, query.getEndTime());
        }

        wrapper.orderByDesc(Material::getCreateTime);

        Page<Material> page = page(new Page<>(query.getCurrent(), query.getSize()), wrapper);
        return PageResult.of(page.getTotal(), page.getPages(), page.getCurrent(), page.getSize(), page.getRecords());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void lockStock(Long workOrderId, Long materialId, String batchNo, BigDecimal quantity, String operator) {
        WorkOrder workOrder = workOrderMapper.selectById(workOrderId);
        if (workOrder == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST.getCode(), "工单不存在");
        }

        if (workOrder.getStatus() > WorkOrderStatusEnum.ARRANGED.getCode()) {
            throw new BusinessException(ResultCode.OPERATION_ERROR.getCode(), "工单已投产，无法锁定库存");
        }

        Material material = getById(materialId);
        if (material == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST.getCode(), "物料不存在");
        }

        LambdaQueryWrapper<MaterialBatch> batchWrapper = new LambdaQueryWrapper<>();
        batchWrapper.eq(MaterialBatch::getMaterialId, materialId);
        batchWrapper.eq(MaterialBatch::getBatchNo, batchNo);
        batchWrapper.eq(MaterialBatch::getStatus, 1);
        MaterialBatch batch = materialBatchMapper.selectOne(batchWrapper);
        if (batch == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST.getCode(), "批次不存在或已出库");
        }

        if (batch.getRemainingQuantity().compareTo(quantity) < 0) {
            throw new BusinessException(ResultCode.OPERATION_ERROR.getCode(), "批次库存不足，剩余：" + batch.getRemainingQuantity());
        }

        BigDecimal availableQuantity = material.getStockQuantity().subtract(getLockedQuantity(materialId));
        if (availableQuantity.compareTo(quantity) < 0) {
            throw new BusinessException(ResultCode.OPERATION_ERROR.getCode(),
                    "可用库存不足，库存：" + material.getStockQuantity() + "，已锁定：" + getLockedQuantity(materialId));
        }

        MaterialStockLock lock = new MaterialStockLock();
        lock.setLockNo(generateLockNo());
        lock.setWorkOrderId(workOrderId);
        lock.setOrderNo(workOrder.getOrderNo());
        lock.setMaterialId(materialId);
        lock.setMaterialCode(material.getMaterialCode());
        lock.setMaterialName(material.getMaterialName());
        lock.setSpecification(material.getSpecification());
        lock.setLockQuantity(quantity);
        lock.setUnitPrice(material.getUnitPrice());
        lock.setTotalPrice(material.getUnitPrice().multiply(quantity));
        lock.setBatchNo(batchNo);
        lock.setStatus(1);
        lock.setLockTime(LocalDateTime.now());
        lock.setOperator(operator != null ? operator : UserContextUtil.getUsername());
        materialStockLockMapper.insert(lock);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void releaseStock(Long workOrderId, Long materialId) {
        LambdaQueryWrapper<MaterialStockLock> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(MaterialStockLock::getWorkOrderId, workOrderId);
        wrapper.eq(MaterialStockLock::getMaterialId, materialId);
        wrapper.eq(MaterialStockLock::getStatus, 1);
        List<MaterialStockLock> locks = materialStockLockMapper.selectList(wrapper);

        for (MaterialStockLock lock : locks) {
            lock.setStatus(0);
            lock.setReleaseTime(LocalDateTime.now());
            materialStockLockMapper.updateById(lock);
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void releaseAllStockByWorkOrder(Long workOrderId) {
        LambdaQueryWrapper<MaterialStockLock> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(MaterialStockLock::getWorkOrderId, workOrderId);
        wrapper.eq(MaterialStockLock::getStatus, 1);
        List<MaterialStockLock> locks = materialStockLockMapper.selectList(wrapper);

        for (MaterialStockLock lock : locks) {
            lock.setStatus(0);
            lock.setReleaseTime(LocalDateTime.now());
            materialStockLockMapper.updateById(lock);
        }
    }

    @Override
    public List<MaterialStockLock> getStockLocksByWorkOrder(Long workOrderId) {
        LambdaQueryWrapper<MaterialStockLock> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(MaterialStockLock::getWorkOrderId, workOrderId);
        wrapper.orderByDesc(MaterialStockLock::getLockTime);
        return materialStockLockMapper.selectList(wrapper);
    }

    private BigDecimal getLockedQuantity(Long materialId) {
        LambdaQueryWrapper<MaterialStockLock> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(MaterialStockLock::getMaterialId, materialId);
        wrapper.eq(MaterialStockLock::getStatus, 1);
        List<MaterialStockLock> locks = materialStockLockMapper.selectList(wrapper);
        BigDecimal total = BigDecimal.ZERO;
        for (MaterialStockLock lock : locks) {
            if (lock.getLockQuantity() != null) {
                total = total.add(lock.getLockQuantity());
            }
        }
        return total;
    }

    private String generateLockNo() {
        String date = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        int count = Math.toIntExact(materialStockLockMapper.selectCount(new LambdaQueryWrapper<MaterialStockLock>()
                .likeRight(MaterialStockLock::getLockNo, "LOCK-" + date)) + 1);
        return String.format("LOCK-%s-%04d", date, count);
    }
}
