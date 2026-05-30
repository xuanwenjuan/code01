package com.textile.production.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.textile.production.common.Result;
import com.textile.production.common.ResultCode;
import com.textile.production.dto.RawMaterialBatchDTO;
import com.textile.production.entity.RawMaterial;
import com.textile.production.entity.RawMaterialBatch;
import com.textile.production.exception.BusinessException;
import com.textile.production.mapper.RawMaterialBatchMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RawMaterialBatchService extends ServiceImpl<RawMaterialBatchMapper, RawMaterialBatch> {

    private final RawMaterialService materialService;

    @Transactional(rollbackFor = Exception.class)
    public Result<RawMaterialBatch> addBatch(RawMaterialBatchDTO dto) {
        RawMaterial material = materialService.getById(dto.getMaterialId());
        if (material == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST.getCode(), "原料不存在");
        }

        String batchCode = generateBatchCode(material.getType());

        RawMaterialBatch batch = new RawMaterialBatch();
        batch.setBatchCode(batchCode);
        batch.setMaterialId(dto.getMaterialId());
        batch.setQuantity(dto.getQuantity());
        batch.setUnitPrice(dto.getUnitPrice());
        batch.setSupplier(dto.getSupplier());
        batch.setProductionDate(dto.getProductionDate());
        batch.setExpiryDate(dto.getExpiryDate());
        batch.setWarehouseArea(dto.getWarehouseArea());
        batch.setHumidity(dto.getHumidity());
        batch.setMoistureWarning(0);
        batch.setStatus(1);
        save(batch);

        materialService.addStock(dto.getMaterialId(), dto.getQuantity());

        if (material.getMoistureProof() == 1 && dto.getHumidity() != null && dto.getHumidity().compareTo(new BigDecimal("60")) > 0) {
            batch.setMoistureWarning(1);
            updateById(batch);
        }

        return Result.success("批次入库成功", batch);
    }

    @Transactional(rollbackFor = Exception.class)
    public Result<Void> useBatch(Long batchId, BigDecimal quantity) {
        RawMaterialBatch batch = getById(batchId);
        if (batch == null || batch.getStatus() == 0) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST.getCode(), "批次不存在或已用完");
        }

        if (batch.getQuantity().compareTo(quantity) < 0) {
            throw new BusinessException(ResultCode.STOCK_NOT_ENOUGH);
        }

        batch.setQuantity(batch.getQuantity().subtract(quantity));
        if (batch.getQuantity().compareTo(BigDecimal.ZERO) <= 0) {
            batch.setStatus(0);
        }
        updateById(batch);

        materialService.reduceStock(batch.getMaterialId(), quantity);

        return Result.success("领料成功");
    }

    public Result<IPage<RawMaterialBatch>> getPage(Integer pageNum, Integer pageSize, Long materialId, Integer status) {
        LambdaQueryWrapper<RawMaterialBatch> wrapper = new LambdaQueryWrapper<>();
        if (materialId != null) {
            wrapper.eq(RawMaterialBatch::getMaterialId, materialId);
        }
        if (status != null) {
            wrapper.eq(RawMaterialBatch::getStatus, status);
        }
        wrapper.orderByDesc(RawMaterialBatch::getCreateTime);

        Page<RawMaterialBatch> page = new Page<>(pageNum, pageSize);
        return Result.success(page(page, wrapper));
    }

    public Result<List<RawMaterialBatch>> getAvailableBatches(Long materialId) {
        LambdaQueryWrapper<RawMaterialBatch> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(RawMaterialBatch::getMaterialId, materialId)
                .eq(RawMaterialBatch::getStatus, 1)
                .gt(RawMaterialBatch::getQuantity, 0)
                .orderByAsc(RawMaterialBatch::getProductionDate);
        return Result.success(list(wrapper));
    }

    public Result<Void> updateHumidity(Long batchId, BigDecimal humidity) {
        RawMaterialBatch batch = getById(batchId);
        if (batch == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }

        batch.setHumidity(humidity);

        RawMaterial material = materialService.getById(batch.getMaterialId());
        if (material != null && material.getMoistureProof() == 1) {
            batch.setMoistureWarning(humidity.compareTo(new BigDecimal("60")) > 0 ? 1 : 0);
        } else {
            batch.setMoistureWarning(0);
        }

        updateById(batch);
        return Result.success("湿度更新成功");
    }

    public Result<List<RawMaterialBatch>> getMoistureWarningList() {
        LambdaQueryWrapper<RawMaterialBatch> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(RawMaterialBatch::getMoistureWarning, 1)
                .eq(RawMaterialBatch::getStatus, 1)
                .orderByAsc(RawMaterialBatch::getWarehouseArea);
        return Result.success(list(wrapper));
    }

    private String generateBatchCode(String materialType) {
        String dateStr = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String prefix = materialType != null ? materialType.substring(0, Math.min(3, materialType.length())).toUpperCase() : "MAT";

        LambdaQueryWrapper<RawMaterialBatch> wrapper = new LambdaQueryWrapper<>();
        wrapper.likeRight(RawMaterialBatch::getBatchCode, prefix + dateStr);
        Long count = count(wrapper);

        String sequence = String.format("%04d", count + 1);
        return prefix + dateStr + sequence;
    }
}
