package com.valve.manufacture.service;

import cn.hutool.core.util.IdUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.valve.manufacture.entity.MaterialBatch;
import com.valve.manufacture.exception.BusinessException;
import com.valve.manufacture.mapper.MaterialBatchMapper;
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
public class MaterialBatchService extends ServiceImpl<MaterialBatchMapper, MaterialBatch> {

    private final MaterialService materialService;

    @Transactional(rollbackFor = Exception.class)
    public MaterialBatch inbound(MaterialBatch batch, Long operatorId) {
        String batchNo = generateBatchNo();
        batch.setBatchNo(batchNo);
        batch.setStatus(1);
        batch.setInboundDate(LocalDate.now());
        save(batch);

        materialService.updateStock(batch.getMaterialId(), batch.getQuantity(), batch.getBatchNo(), null);
        return batch;
    }

    @Transactional(rollbackFor = Exception.class)
    public void outbound(Long batchId, BigDecimal quantity, Long operatorId, String remark) {
        MaterialBatch batch = getById(batchId);
        if (batch == null) {
            throw new BusinessException("批次不存在");
        }
        if (batch.getStatus() == 0) {
            throw new BusinessException("批次已用完");
        }
        if (batch.getQuantity().compareTo(quantity) < 0) {
            throw new BusinessException("批次库存不足");
        }

        BigDecimal remaining = batch.getQuantity().subtract(quantity);
        if (remaining.compareTo(BigDecimal.ZERO) == 0) {
            batch.setStatus(0);
        }
        batch.setQuantity(remaining);
        updateById(batch);

        materialService.updateStock(batch.getMaterialId(), quantity.negate(), batch.getBatchNo(), null);
    }

    private String generateBatchNo() {
        String dateStr = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String random = IdUtil.randomUUID().substring(0, 8).toUpperCase();
        return "BATCH-" + dateStr + "-" + random;
    }

    public List<MaterialBatch> getByMaterialId(Long materialId) {
        return list(new LambdaQueryWrapper<MaterialBatch>()
                .eq(MaterialBatch::getMaterialId, materialId)
                .eq(MaterialBatch::getDeleted, 0)
                .orderByDesc(MaterialBatch::getCreateTime));
    }

    public List<MaterialBatch> getAvailableBatches(Long materialId) {
        return list(new LambdaQueryWrapper<MaterialBatch>()
                .eq(MaterialBatch::getMaterialId, materialId)
                .eq(MaterialBatch::getStatus, 1)
                .eq(MaterialBatch::getDeleted, 0)
                .orderByAsc(MaterialBatch::getInboundDate));
    }

    public Page<MaterialBatch> pageWithCondition(Integer current, Integer size,
                                                  Long materialId, Integer status,
                                                  LocalDate startDate, LocalDate endDate) {
        LambdaQueryWrapper<MaterialBatch> wrapper = new LambdaQueryWrapper<>();
        if (materialId != null) {
            wrapper.eq(MaterialBatch::getMaterialId, materialId);
        }
        if (status != null) {
            wrapper.eq(MaterialBatch::getStatus, status);
        }
        if (startDate != null) {
            wrapper.ge(MaterialBatch::getInboundDate, startDate);
        }
        if (endDate != null) {
            wrapper.le(MaterialBatch::getInboundDate, endDate);
        }
        wrapper.eq(MaterialBatch::getDeleted, 0);
        wrapper.orderByDesc(MaterialBatch::getCreateTime);

        return page(new Page<>(current, size), wrapper);
    }

    @Transactional(rollbackFor = Exception.class)
    public void useBatch(Long batchId, BigDecimal quantity, Long workOrderId) {
        MaterialBatch batch = getById(batchId);
        if (batch == null) {
            throw new BusinessException("批次不存在");
        }
        if (batch.getStatus() == 0) {
            throw new BusinessException("批次已用完");
        }
        if (batch.getQuantity().compareTo(quantity) < 0) {
            throw new BusinessException("批次库存不足，剩余：" + batch.getQuantity());
        }

        BigDecimal remaining = batch.getQuantity().subtract(quantity);
        if (remaining.compareTo(BigDecimal.ZERO) == 0) {
            batch.setStatus(0);
        }
        batch.setQuantity(remaining);
        updateById(batch);

        materialService.updateStock(batch.getMaterialId(), quantity.negate(), batch.getBatchNo(), null);
    }

    @Transactional(rollbackFor = Exception.class)
    public void returnBatch(Long batchId, BigDecimal quantity, Long operatorId, String remark) {
        MaterialBatch batch = getById(batchId);
        if (batch == null) {
            throw new BusinessException("批次不存在");
        }
        if (batch.getStatus() == 0) {
            batch.setStatus(1);
        }
        batch.setQuantity(batch.getQuantity().add(quantity));
        updateById(batch);

        materialService.updateStock(batch.getMaterialId(), quantity, batch.getBatchNo(), null);
    }
}
