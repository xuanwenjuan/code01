package com.oiledumbrella.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.oiledumbrella.entity.Material;
import com.oiledumbrella.entity.MaterialBatch;
import com.oiledumbrella.exception.BusinessException;
import com.oiledumbrella.mapper.MaterialBatchMapper;
import com.oiledumbrella.mapper.MaterialMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class MaterialBatchService {

    private final MaterialBatchMapper batchMapper;
    private final MaterialMapper materialMapper;

    public Page<MaterialBatch> page(Integer pageNum, Integer pageSize, Long materialId, Integer status) {
        Page<MaterialBatch> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<MaterialBatch> wrapper = new LambdaQueryWrapper<>();
        if (materialId != null) {
            wrapper.eq(MaterialBatch::getMaterialId, materialId);
        }
        if (status != null) {
            wrapper.eq(MaterialBatch::getStatus, status);
        }
        wrapper.orderByDesc(MaterialBatch::getCreateTime);
        return batchMapper.selectPage(page, wrapper);
    }

    @Transactional
    public void inStock(MaterialBatch batch, Long operatorId) {
        Material material = materialMapper.selectById(batch.getMaterialId());
        if (material == null) {
            throw new BusinessException("原料不存在");
        }

        String batchCode = "BAT" + LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd")) +
                String.format("%04d", (int) (Math.random() * 10000));
        batch.setBatchCode(batchCode);
        batch.setStatus(1);
        batch.setOperatorId(operatorId);

        if (batch.getPurchaseDate() == null) {
            batch.setPurchaseDate(LocalDate.now());
        }

        if (batch.getTotalPrice() == null) {
            batch.setTotalPrice(batch.getUnitPrice().multiply(batch.getQuantity()));
        }

        batchMapper.insert(batch);

        material.setCurrentStock(material.getCurrentStock().add(batch.getQuantity()));
        if (material.getCurrentStock().compareTo(material.getMinStock()) >= 0) {
            material.setStatus(2);
        }
        materialMapper.updateById(material);
    }

    @Transactional
    public void outStock(Long batchId, BigDecimal quantity, Long operatorId) {
        MaterialBatch batch = batchMapper.selectById(batchId);
        if (batch == null) {
            throw new BusinessException("批次不存在");
        }

        if (batch.getQuantity().compareTo(quantity) < 0) {
            throw new BusinessException("批次库存不足");
        }

        batch.setQuantity(batch.getQuantity().subtract(quantity));
        if (batch.getQuantity().compareTo(BigDecimal.ZERO) == 0) {
            batch.setStatus(0);
        }
        batchMapper.updateById(batch);

        Material material = materialMapper.selectById(batch.getMaterialId());
        material.setCurrentStock(material.getCurrentStock().subtract(quantity));
        if (material.getCurrentStock().compareTo(material.getMinStock()) < 0) {
            material.setStatus(1);
        }
        if (material.getCurrentStock().compareTo(BigDecimal.ZERO) == 0) {
            material.setStatus(0);
        }
        materialMapper.updateById(material);
    }

    public MaterialBatch getById(Long id) {
        return batchMapper.selectById(id);
    }

    public void delete(Long id) {
        batchMapper.deleteById(id);
    }
}
