package com.radiator.management.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.radiator.management.entity.MaterialInventory;
import com.radiator.management.exception.BusinessException;
import com.radiator.management.mapper.MaterialInventoryMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MaterialInventoryService {

    private final MaterialInventoryMapper materialMapper;

    public void addMaterial(MaterialInventory material) {
        LambdaQueryWrapper<MaterialInventory> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(MaterialInventory::getMaterialCode, material.getMaterialCode());
        if (materialMapper.selectCount(wrapper) > 0) {
            throw new BusinessException("物料编码已存在");
        }
        
        String batchNo = "BATCH-" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        material.setBatchNo(batchNo);
        
        updateStatus(material);
        materialMapper.insert(material);
    }

    public void updateMaterial(MaterialInventory material) {
        updateStatus(material);
        materialMapper.updateById(material);
    }

    public void deleteMaterial(Long id) {
        materialMapper.deleteById(id);
    }

    public List<MaterialInventory> list(String status) {
        LambdaQueryWrapper<MaterialInventory> wrapper = new LambdaQueryWrapper<>();
        if (status != null && !status.isEmpty()) {
            wrapper.eq(MaterialInventory::getStatus, status);
        }
        wrapper.orderByDesc(MaterialInventory::getCreateTime);
        return materialMapper.selectList(wrapper);
    }

    public MaterialInventory getById(Long id) {
        return materialMapper.selectById(id);
    }

    public void updateStock(Long id, BigDecimal quantity) {
        MaterialInventory material = materialMapper.selectById(id);
        if (material == null) {
            throw new BusinessException("物料不存在");
        }
        material.setQuantity(material.getQuantity().add(quantity));
        updateStatus(material);
        materialMapper.updateById(material);
    }

    private void updateStatus(MaterialInventory material) {
        if (material.getQuantity().compareTo(material.getWarningQuantity()) <= 0) {
            material.setStatus("WARNING");
        } else {
            material.setStatus("NORMAL");
        }
    }

    public List<MaterialInventory> getMoistureProofMaterials() {
        return materialMapper.selectList(
            new LambdaQueryWrapper<MaterialInventory>()
                .eq(MaterialInventory::getIsMoistureProof, 1)
                .eq(MaterialInventory::getStatus, "NORMAL")
        );
    }
}