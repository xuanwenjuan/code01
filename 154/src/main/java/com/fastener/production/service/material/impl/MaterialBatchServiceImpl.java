package com.fastener.production.service.material.impl;

import cn.hutool.core.date.DateUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.fastener.production.common.entity.PageQuery;
import com.fastener.production.common.enums.MaterialTypeEnum;
import com.fastener.production.common.enums.StockStatusEnum;
import com.fastener.production.common.exception.BusinessException;
import com.fastener.production.common.result.ResultCode;
import com.fastener.production.common.utils.UserContext;
import com.fastener.production.entity.material.MaterialBatch;
import com.fastener.production.entity.material.MaterialStockRecord;
import com.fastener.production.entity.material.MetalMaterial;
import com.fastener.production.entity.material.dto.MaterialInboundDTO;
import com.fastener.production.entity.material.dto.MaterialOutboundDTO;
import com.fastener.production.mapper.material.MaterialBatchMapper;
import com.fastener.production.mapper.material.MaterialStockRecordMapper;
import com.fastener.production.mapper.material.MetalMaterialMapper;
import com.fastener.production.service.material.MaterialBatchService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MaterialBatchServiceImpl extends ServiceImpl<MaterialBatchMapper, MaterialBatch> implements MaterialBatchService {

    private final MaterialBatchMapper materialBatchMapper;
    private final MetalMaterialMapper metalMaterialMapper;
    private final MaterialStockRecordMapper stockRecordMapper;

    @Override
    public IPage<MaterialBatch> page(PageQuery pageQuery, Long materialId, String batchCode, Integer status) {
        Page<MaterialBatch> page = new Page<>(pageQuery.getPageNum(), pageQuery.getPageSize());
        LambdaQueryWrapper<MaterialBatch> wrapper = new LambdaQueryWrapper<>();
        if (materialId != null) {
            wrapper.eq(MaterialBatch::getMaterialId, materialId);
        }
        if (batchCode != null && !batchCode.isEmpty()) {
            wrapper.like(MaterialBatch::getBatchCode, batchCode);
        }
        if (status != null) {
            wrapper.eq(MaterialBatch::getStatus, status);
        }
        wrapper.orderByDesc(MaterialBatch::getInboundTime);
        return this.page(page, wrapper);
    }

    @Override
    public List<MaterialBatch> getAvailableBatches(Long materialId) {
        return materialBatchMapper.selectAvailableByMaterialId(materialId);
    }

    @Override
    public BigDecimal getAvailableQuantity(Long materialId) {
        return materialBatchMapper.sumAvailableQuantity(materialId);
    }

    @Override
    public String generateBatchCode(Long materialId) {
        MetalMaterial material = metalMaterialMapper.selectById(materialId);
        if (material == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST, "原料不存在");
        }

        String dateStr = DateUtil.format(LocalDate.now(), "yyyyMMdd");
        String prefix = material.getMaterialCode() + "-" + dateStr + "-";

        Long count = this.count(new LambdaQueryWrapper<MaterialBatch>()
                .like(MaterialBatch::getBatchCode, prefix));

        return prefix + String.format("%04d", count + 1);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void inbound(MaterialInboundDTO dto) {
        MetalMaterial material = metalMaterialMapper.selectById(dto.getMaterialId());
        if (material == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST, "原料不存在");
        }

        if (material.getStatus().equals(StockStatusEnum.STOP_PURCHASE.getCode())) {
            throw new BusinessException(ResultCode.DATA_STATUS_ERROR, "该原料已停止采购");
        }

        String batchCode = generateBatchCode(dto.getMaterialId());

        MaterialBatch batch = new MaterialBatch();
        batch.setBatchCode(batchCode);
        batch.setMaterialId(dto.getMaterialId());
        batch.setMaterialName(material.getMaterialName());
        batch.setQuantity(dto.getQuantity());
        batch.setAvailableQuantity(dto.getQuantity());
        batch.setUnitPrice(dto.getUnitPrice());
        batch.setTotalAmount(dto.getQuantity().multiply(dto.getUnitPrice()));
        batch.setInboundTime(LocalDateTime.now());
        batch.setProductionDate(dto.getProductionDate());
        batch.setExpirationDate(dto.getExpirationDate());
        batch.setWarehouseCode(dto.getWarehouseCode());
        batch.setLocationCode(dto.getLocationCode());
        batch.setInspector(dto.getInspector());
        batch.setInspectionResult(dto.getInspectionResult());
        batch.setStatus(1);
        batch.setRemark(dto.getRemark());
        this.save(batch);

        MaterialStockRecord record = new MaterialStockRecord();
        record.setRecordNo("IN" + System.currentTimeMillis());
        record.setRecordType(1);
        record.setMaterialId(dto.getMaterialId());
        record.setMaterialName(material.getMaterialName());
        record.setBatchId(batch.getId());
        record.setBatchCode(batchCode);
        record.setQuantity(dto.getQuantity());
        record.setUnitPrice(dto.getUnitPrice());
        record.setTotalAmount(dto.getQuantity().multiply(dto.getUnitPrice()));
        record.setOperator(UserContext.getUsername());
        record.setOperateTime(LocalDateTime.now());
        record.setRemark(dto.getRemark());
        stockRecordMapper.insert(record);

        updateMaterialStatus(dto.getMaterialId());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void outbound(MaterialOutboundDTO dto) {
        MaterialBatch batch = this.getById(dto.getBatchId());
        if (batch == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST, "批次不存在");
        }

        if (batch.getAvailableQuantity().compareTo(dto.getQuantity()) < 0) {
            throw new BusinessException(ResultCode.STOCK_NOT_ENOUGH, "库存不足，可用数量：" + batch.getAvailableQuantity());
        }

        batch.setAvailableQuantity(batch.getAvailableQuantity().subtract(dto.getQuantity()));
        if (batch.getAvailableQuantity().compareTo(BigDecimal.ZERO) == 0) {
            batch.setStatus(3);
        } else {
            batch.setStatus(2);
        }
        this.updateById(batch);

        MetalMaterial material = metalMaterialMapper.selectById(batch.getMaterialId());

        MaterialStockRecord record = new MaterialStockRecord();
        record.setRecordNo("OUT" + System.currentTimeMillis());
        record.setRecordType(2);
        record.setMaterialId(batch.getMaterialId());
        record.setMaterialName(batch.getMaterialName());
        record.setBatchId(dto.getBatchId());
        record.setBatchCode(batch.getBatchCode());
        record.setQuantity(dto.getQuantity());
        record.setUnitPrice(batch.getUnitPrice());
        record.setTotalAmount(dto.getQuantity().multiply(batch.getUnitPrice()));
        record.setWorkOrderId(dto.getWorkOrderId());
        record.setOperator(dto.getOperator() != null ? dto.getOperator() : UserContext.getUsername());
        record.setOperateTime(LocalDateTime.now());
        record.setRemark(dto.getRemark());
        stockRecordMapper.insert(record);

        updateMaterialStatus(batch.getMaterialId());
    }

    private void updateMaterialStatus(Long materialId) {
        MetalMaterial material = metalMaterialMapper.selectById(materialId);
        if (material == null) {
            return;
        }

        BigDecimal availableQuantity = materialBatchMapper.sumAvailableQuantity(materialId);

        if (material.getStatus().equals(StockStatusEnum.STOP_PURCHASE.getCode())) {
            return;
        }

        if (availableQuantity.compareTo(material.getWarningQuantity()) <= 0) {
            material.setStatus(StockStatusEnum.WARNING.getCode());
        } else {
            material.setStatus(StockStatusEnum.NORMAL.getCode());
        }

        if (material.getMaterialType().equals(MaterialTypeEnum.CARBON_STEEL.getCode())
                && material.getRustProofCycle() != null
                && material.getRustProofCycle() > 0) {
            List<MaterialBatch> batches = materialBatchMapper.selectAvailableByMaterialId(materialId);
            for (MaterialBatch batch : batches) {
                if (batch.getExpirationDate() != null && batch.getExpirationDate().isBefore(LocalDate.now())) {
                    batch.setStatus(4);
                    this.updateById(batch);
                }
            }
        }

        metalMaterialMapper.updateById(material);
    }
}
