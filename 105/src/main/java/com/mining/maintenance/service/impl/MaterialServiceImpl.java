package com.mining.maintenance.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.mining.maintenance.dto.MaterialUsageDTO;
import com.mining.maintenance.entity.Material;
import com.mining.maintenance.entity.MaterialUsageRecord;
import com.mining.maintenance.exception.BusinessException;
import com.mining.maintenance.mapper.MaterialMapper;
import com.mining.maintenance.mapper.MaterialUsageRecordMapper;
import com.mining.maintenance.service.MaterialService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Random;

@Service
public class MaterialServiceImpl extends ServiceImpl<MaterialMapper, Material> implements MaterialService {

    @Autowired
    private MaterialUsageRecordMapper usageRecordMapper;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void useMaterial(MaterialUsageDTO dto) {
        Material material = getById(dto.getMaterialId());
        if (material == null) {
            throw new BusinessException("物资不存在");
        }
        if (material.getStockQuantity() < dto.getQuantity()) {
            throw new BusinessException("库存不足，当前库存：" + material.getStockQuantity());
        }

        material.setStockQuantity(material.getStockQuantity() - dto.getQuantity());
        updateById(material);

        MaterialUsageRecord record = new MaterialUsageRecord();
        record.setRecordNo(generateRecordNo());
        record.setOrderId(dto.getOrderId());
        record.setOrderNo(dto.getOrderNo());
        record.setMaterialId(dto.getMaterialId());
        record.setMaterialCode(material.getMaterialCode());
        record.setMaterialName(material.getMaterialName());
        record.setSpecification(material.getSpecification());
        record.setUnit(material.getUnit());
        record.setUnitPrice(material.getUnitPrice());
        record.setQuantity(dto.getQuantity());
        record.setTotalAmount(material.getUnitPrice().multiply(BigDecimal.valueOf(dto.getQuantity())));
        record.setMiningArea(dto.getMiningArea());
        record.setEquipmentId(dto.getEquipmentId());
        record.setEquipmentCode(dto.getEquipmentCode());
        record.setReceiverId(dto.getReceiverId());
        record.setReceiverName(dto.getReceiverName());
        record.setReceiveTime(LocalDateTime.now());
        record.setUsagePurpose(dto.getUsagePurpose());
        record.setStatus("PENDING");
        record.setRemarks(dto.getRemarks());
        usageRecordMapper.insert(record);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void verifyRecord(Long recordId, Long verifierId, String verifierName) {
        MaterialUsageRecord record = usageRecordMapper.selectById(recordId);
        if (record == null) {
            throw new BusinessException("记录不存在");
        }
        if (!"PENDING".equals(record.getStatus())) {
            throw new BusinessException("记录状态不正确");
        }

        record.setStatus("VERIFIED");
        record.setVerifierId(verifierId);
        record.setVerifierName(verifierName);
        record.setVerifyTime(LocalDateTime.now());
        usageRecordMapper.updateById(record);
    }

    @Override
    public Page<MaterialUsageRecord> queryUsageRecords(int page, int size, String miningArea, String status) {
        Page<MaterialUsageRecord> pageParam = new Page<>(page, size);
        LambdaQueryWrapper<MaterialUsageRecord> wrapper = new LambdaQueryWrapper<>();
        if (miningArea != null && !miningArea.isEmpty()) {
            wrapper.eq(MaterialUsageRecord::getMiningArea, miningArea);
        }
        if (status != null && !status.isEmpty()) {
            wrapper.eq(MaterialUsageRecord::getStatus, status);
        }
        wrapper.orderByDesc(MaterialUsageRecord::getReceiveTime);
        return usageRecordMapper.selectPage(pageParam, wrapper);
    }

    private String generateRecordNo() {
        String date = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        String random = String.format("%04d", new Random().nextInt(10000));
        return "MR" + date + random;
    }
}