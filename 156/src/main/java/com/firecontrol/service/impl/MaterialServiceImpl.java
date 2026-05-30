package com.firecontrol.service.impl;

import cn.hutool.core.date.DateUtil;
import cn.hutool.core.util.IdUtil;
import cn.hutool.core.util.StrUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.firecontrol.common.PageQuery;
import com.firecontrol.common.ResultCode;
import com.firecontrol.dto.MaterialDTO;
import com.firecontrol.dto.MaterialStockInDTO;
import com.firecontrol.entity.Material;
import com.firecontrol.entity.MaterialBatch;
import com.firecontrol.entity.MaterialStockRecord;
import com.firecontrol.entity.WorkOrder;
import com.firecontrol.exception.BusinessException;
import com.firecontrol.mapper.MaterialBatchMapper;
import com.firecontrol.mapper.MaterialMapper;
import com.firecontrol.mapper.MaterialStockRecordMapper;
import com.firecontrol.mapper.WorkOrderMapper;
import com.firecontrol.service.MaterialService;
import com.firecontrol.utils.UserContextUtil;
import jakarta.annotation.Resource;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class MaterialServiceImpl implements MaterialService {

    @Resource
    private MaterialMapper materialMapper;

    @Resource
    private MaterialBatchMapper materialBatchMapper;

    @Resource
    private MaterialStockRecordMapper stockRecordMapper;

    @Resource
    private WorkOrderMapper workOrderMapper;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void addMaterial(MaterialDTO dto) {
        Material existing = materialMapper.selectOne(
                new LambdaQueryWrapper<Material>()
                        .eq(Material::getMaterialCode, dto.getMaterialCode())
        );
        if (existing != null) {
            throw new BusinessException(ResultCode.DATA_ALREADY_EXIST.getCode(), "物资编码已存在");
        }

        Material material = new Material();
        BeanUtils.copyProperties(dto, material);

        if (material.getTotalStock() == null) {
            material.setTotalStock(BigDecimal.ZERO);
        }
        if (material.getAvailableStock() == null) {
            material.setAvailableStock(BigDecimal.ZERO);
        }
        if (material.getFrozenStock() == null) {
            material.setFrozenStock(BigDecimal.ZERO);
        }
        if (material.getStockStatus() == null) {
            material.setStockStatus(1);
        }
        if (material.getPurchaseStatus() == null) {
            material.setPurchaseStatus(1);
        }

        updateStockStatus(material);
        materialMapper.insert(material);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateMaterial(MaterialDTO dto) {
        Material material = materialMapper.selectById(dto.getId());
        if (material == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }

        Material existing = materialMapper.selectOne(
                new LambdaQueryWrapper<Material>()
                        .eq(Material::getMaterialCode, dto.getMaterialCode())
                        .ne(Material::getId, dto.getId())
        );
        if (existing != null) {
            throw new BusinessException(ResultCode.DATA_ALREADY_EXIST.getCode(), "物资编码已存在");
        }

        BeanUtils.copyProperties(dto, material);
        updateStockStatus(material);
        materialMapper.updateById(material);
    }

    private void updateStockStatus(Material material) {
        if (material.getAvailableStock() == null) {
            material.setAvailableStock(BigDecimal.ZERO);
        }
        if (material.getWarningStock() == null) {
            material.setWarningStock(BigDecimal.ZERO);
        }

        if (material.getAvailableStock().compareTo(material.getWarningStock()) <= 0) {
            material.setStockStatus(2);
        } else {
            material.setStockStatus(1);
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteMaterial(Long id) {
        Material material = materialMapper.selectById(id);
        if (material == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }
        if (material.getTotalStock() != null && material.getTotalStock().compareTo(BigDecimal.ZERO) > 0) {
            throw new BusinessException(ResultCode.DATA_IN_USE.getCode(), "该物资存在库存，无法删除");
        }
        materialMapper.deleteById(id);
    }

    @Override
    public Material getMaterialById(Long id) {
        return materialMapper.selectById(id);
    }

    @Override
    public IPage<Material> getMaterialPage(MaterialDTO dto, PageQuery pageQuery) {
        Page<Material> page = new Page<>(pageQuery.getPageNum(), pageQuery.getPageSize());
        LambdaQueryWrapper<Material> wrapper = new LambdaQueryWrapper<>();

        if (StrUtil.isNotBlank(dto.getMaterialCode())) {
            wrapper.like(Material::getMaterialCode, dto.getMaterialCode());
        }
        if (StrUtil.isNotBlank(dto.getMaterialName())) {
            wrapper.like(Material::getMaterialName, dto.getMaterialName());
        }
        if (StrUtil.isNotBlank(dto.getMaterialType())) {
            wrapper.eq(Material::getMaterialType, dto.getMaterialType());
        }
        if (StrUtil.isNotBlank(dto.getMaterialTexture())) {
            wrapper.like(Material::getMaterialTexture, dto.getMaterialTexture());
        }
        if (StrUtil.isNotBlank(dto.getSpecification())) {
            wrapper.like(Material::getSpecification, dto.getSpecification());
        }
        if (dto.getStockStatus() != null) {
            wrapper.eq(Material::getStockStatus, dto.getStockStatus());
        }
        if (dto.getPurchaseStatus() != null) {
            wrapper.eq(Material::getPurchaseStatus, dto.getPurchaseStatus());
        }
        if (dto.getIsPressureBearing() != null) {
            wrapper.eq(Material::getIsPressureBearing, dto.getIsPressureBearing());
        }

        wrapper.orderByDesc(Material::getCreateTime);
        return materialMapper.selectPage(page, wrapper);
    }

    @Override
    public List<Material> getWarningStockList() {
        return materialMapper.selectList(
                new LambdaQueryWrapper<Material>()
                        .eq(Material::getStockStatus, 2)
                        .orderByAsc(Material::getAvailableStock)
        );
    }

    @Override
    public List<Material> getRecheckSoonList() {
        LocalDate today = LocalDate.now();
        LocalDate sevenDaysLater = today.plusDays(7);
        return materialMapper.selectList(
                new LambdaQueryWrapper<Material>()
                        .eq(Material::getIsPressureBearing, 1)
                        .ge(Material::getNextRecheckDate, today)
                        .le(Material::getNextRecheckDate, sevenDaysLater)
                        .orderByAsc(Material::getNextRecheckDate)
        );
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void stockIn(MaterialStockInDTO dto) {
        Material material = materialMapper.selectById(dto.getMaterialId());
        if (material == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }

        if (material.getPurchaseStatus() == 2) {
            throw new BusinessException("该物资已停止采购，无法入库");
        }

        String batchCode = generateBatchCode(material.getMaterialCode());

        MaterialBatch batch = new MaterialBatch();
        batch.setBatchCode(batchCode);
        batch.setMaterialId(material.getId());
        batch.setMaterialCode(material.getMaterialCode());
        batch.setMaterialName(material.getMaterialName());
        batch.setQuantity(dto.getQuantity());
        batch.setAvailableQuantity(dto.getQuantity());
        batch.setProductionDate(dto.getProductionDate());
        batch.setExpiryDate(dto.getExpiryDate());
        batch.setQualityStatus(1);
        batch.setInspectionReport(dto.getInspectionReport());
        batch.setSupplier(dto.getSupplier() != null ? dto.getSupplier() : material.getSupplier());
        batch.setWarehouseLocation(dto.getWarehouseLocation());
        batch.setRemark(dto.getRemark());

        if (material.getIsPressureBearing() != null && material.getIsPressureBearing() == 1 && material.getRecheckCycleDays() != null) {
            LocalDate recheckDate = LocalDate.now().plusDays(material.getRecheckCycleDays());
            batch.setRecheckDate(recheckDate);
            batch.setRecheckStatus(0);
        }

        materialBatchMapper.insert(batch);
        materialMapper.addStock(material.getId(), dto.getQuantity());

        Material updated = materialMapper.selectById(material.getId());
        updateStockStatus(updated);
        materialMapper.updateById(updated);
    }

    @Override
    public String generateBatchCode(String materialCode) {
        String dateStr = DateUtil.format(DateUtil.date(), "yyyyMMdd");
        String random = IdUtil.randomUUID().substring(0, 6).toUpperCase();
        return materialCode + "-" + dateStr + "-" + random;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateRecheckStatus(Long batchId, Integer status, String remark) {
        MaterialBatch batch = materialBatchMapper.selectById(batchId);
        if (batch == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }

        batch.setRecheckStatus(status);
        if (StrUtil.isNotBlank(remark)) {
            batch.setRemark(remark);
        }

        if (status == 1) {
            Material material = materialMapper.selectById(batch.getMaterialId());
            if (material != null && material.getRecheckCycleDays() != null) {
                batch.setRecheckDate(LocalDate.now().plusDays(material.getRecheckCycleDays()));
                batch.setRecheckStatus(0);
            }
        }

        materialBatchMapper.updateById(batch);
    }

    @Override
    public List<MaterialBatch> getMaterialBatches(Long materialId) {
        return materialBatchMapper.selectList(
                new LambdaQueryWrapper<MaterialBatch>()
                        .eq(MaterialBatch::getMaterialId, materialId)
                        .orderByDesc(MaterialBatch::getCreateTime)
        );
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void stockOut(Long workOrderId, Long materialId, Long batchId, BigDecimal quantity, String remark) {
        Material material = materialMapper.selectById(materialId);
        if (material == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }

        MaterialBatch batch = materialBatchMapper.selectById(batchId);
        if (batch == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST.getCode(), "批次不存在");
        }

        if (batch.getAvailableQuantity().compareTo(quantity) < 0) {
            throw new BusinessException("批次可用库存不足");
        }

        if (batch.getQualityStatus() != 1) {
            throw new BusinessException("该批次质检不合格，无法出库");
        }

        WorkOrder workOrder = null;
        String orderNo = null;
        if (workOrderId != null) {
            workOrder = workOrderMapper.selectById(workOrderId);
            if (workOrder != null) {
                orderNo = workOrder.getOrderNo();
            }
        }

        BigDecimal beforeQuantity = material.getAvailableStock();
        batch.setAvailableQuantity(batch.getAvailableQuantity().subtract(quantity));
        materialBatchMapper.updateById(batch);

        materialMapper.reduceStock(materialId, quantity);

        Material updated = materialMapper.selectById(materialId);
        updateStockStatus(updated);
        materialMapper.updateById(updated);

        MaterialStockRecord record = new MaterialStockRecord();
        record.setRecordNo("OUT" + DateUtil.format(DateUtil.date(), "yyyyMMddHHmmss") + IdUtil.randomUUID().substring(0, 4).toUpperCase());
        record.setRecordType(2);
        record.setMaterialId(materialId);
        record.setMaterialCode(material.getMaterialCode());
        record.setMaterialName(material.getMaterialName());
        record.setBatchId(batchId);
        record.setBatchCode(batch.getBatchCode());
        record.setQuantity(quantity);
        record.setBeforeQuantity(beforeQuantity);
        record.setAfterQuantity(updated.getAvailableStock());
        record.setWorkOrderId(workOrderId);
        record.setOrderNo(orderNo);
        record.setOperatorName(UserContextUtil.getUsername());
        record.setOperateTime(LocalDateTime.now());
        record.setRemark(remark);
        stockRecordMapper.insert(record);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void stockReturn(Long workOrderId, Long materialId, Long batchId, BigDecimal quantity, String remark) {
        Material material = materialMapper.selectById(materialId);
        if (material == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }

        MaterialBatch batch = materialBatchMapper.selectById(batchId);
        if (batch == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST.getCode(), "批次不存在");
        }

        WorkOrder workOrder = null;
        String orderNo = null;
        if (workOrderId != null) {
            workOrder = workOrderMapper.selectById(workOrderId);
            if (workOrder != null) {
                orderNo = workOrder.getOrderNo();
            }
        }

        BigDecimal beforeQuantity = material.getAvailableStock();
        batch.setAvailableQuantity(batch.getAvailableQuantity().add(quantity));
        materialBatchMapper.updateById(batch);

        materialMapper.addStock(materialId, quantity);

        Material updated = materialMapper.selectById(materialId);
        updateStockStatus(updated);
        materialMapper.updateById(updated);

        MaterialStockRecord record = new MaterialStockRecord();
        record.setRecordNo("RET" + DateUtil.format(DateUtil.date(), "yyyyMMddHHmmss") + IdUtil.randomUUID().substring(0, 4).toUpperCase());
        record.setRecordType(3);
        record.setMaterialId(materialId);
        record.setMaterialCode(material.getMaterialCode());
        record.setMaterialName(material.getMaterialName());
        record.setBatchId(batchId);
        record.setBatchCode(batch.getBatchCode());
        record.setQuantity(quantity);
        record.setBeforeQuantity(beforeQuantity);
        record.setAfterQuantity(updated.getAvailableStock());
        record.setWorkOrderId(workOrderId);
        record.setOrderNo(orderNo);
        record.setOperatorName(UserContextUtil.getUsername());
        record.setOperateTime(LocalDateTime.now());
        record.setRemark(remark);
        stockRecordMapper.insert(record);
    }

    @Override
    public IPage<MaterialStockRecord> getStockRecordPage(Long materialId, Integer recordType, PageQuery pageQuery) {
        Page<MaterialStockRecord> page = new Page<>(pageQuery.getPageNum(), pageQuery.getPageSize());
        LambdaQueryWrapper<MaterialStockRecord> wrapper = new LambdaQueryWrapper<>();

        if (materialId != null) {
            wrapper.eq(MaterialStockRecord::getMaterialId, materialId);
        }
        if (recordType != null) {
            wrapper.eq(MaterialStockRecord::getRecordType, recordType);
        }

        wrapper.orderByDesc(MaterialStockRecord::getOperateTime);
        return stockRecordMapper.selectPage(page, wrapper);
    }

    @Override
    public List<Material> searchMaterials(String keyword, String materialType, Integer stockStatus) {
        LambdaQueryWrapper<Material> wrapper = new LambdaQueryWrapper<>();

        if (StrUtil.isNotBlank(keyword)) {
            wrapper.and(w -> w.like(Material::getMaterialCode, keyword)
                    .or().like(Material::getMaterialName, keyword)
                    .or().like(Material::getSpecification, keyword));
        }
        if (StrUtil.isNotBlank(materialType)) {
            wrapper.eq(Material::getMaterialType, materialType);
        }
        if (stockStatus != null) {
            wrapper.eq(Material::getStockStatus, stockStatus);
        }

        wrapper.orderByDesc(Material::getCreateTime);
        return materialMapper.selectList(wrapper);
    }
}
