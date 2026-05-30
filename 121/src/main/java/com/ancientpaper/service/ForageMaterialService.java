package com.ancientpaper.service;

import com.ancientpaper.dto.ForageMaterialDTO;
import com.ancientpaper.entity.ForageMaterial;
import com.ancientpaper.entity.MaterialLockRecord;
import com.ancientpaper.enums.MaterialStatusEnum;
import com.ancientpaper.exception.BusinessException;
import com.ancientpaper.mapper.ForageMaterialMapper;
import com.ancientpaper.mapper.MaterialLockRecordMapper;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ForageMaterialService {

    private final ForageMaterialMapper materialMapper;
    private final MaterialLockRecordMapper lockRecordMapper;

    public IPage<ForageMaterial> getMaterialPage(Integer pageNum, Integer pageSize, 
                                                  String materialName, Integer status,
                                                  String originPlace, BigDecimal minQuantity, 
                                                  BigDecimal maxQuantity) {
        Page<ForageMaterial> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<ForageMaterial> wrapper = new LambdaQueryWrapper<>();
        
        if (materialName != null && !materialName.isEmpty()) {
            wrapper.like(ForageMaterial::getMaterialName, materialName);
        }
        if (status != null) {
            wrapper.eq(ForageMaterial::getStatus, status);
        }
        if (originPlace != null && !originPlace.isEmpty()) {
            wrapper.like(ForageMaterial::getOriginPlace, originPlace);
        }
        if (minQuantity != null) {
            wrapper.ge(ForageMaterial::getQuantity, minQuantity);
        }
        if (maxQuantity != null) {
            wrapper.le(ForageMaterial::getQuantity, maxQuantity);
        }
        
        wrapper.orderByDesc(ForageMaterial::getCreateTime);
        return materialMapper.selectPage(page, wrapper);
    }

    public List<ForageMaterial> getAvailableMaterials(String materialName) {
        LambdaQueryWrapper<ForageMaterial> wrapper = new LambdaQueryWrapper<>();
        wrapper.in(ForageMaterial::getStatus, 
                   MaterialStatusEnum.ADEQUATE.getCode(), 
                   MaterialStatusEnum.WARNING.getCode());
        
        if (materialName != null && !materialName.isEmpty()) {
            wrapper.like(ForageMaterial::getMaterialName, materialName);
        }
        
        wrapper.orderByAsc(ForageMaterial::getMaterialName);
        return materialMapper.selectList(wrapper);
    }

    public ForageMaterial getMaterialById(Long id) {
        return materialMapper.selectById(id);
    }

    @Transactional(rollbackFor = Exception.class)
    public void addMaterial(ForageMaterialDTO dto) {
        ForageMaterial material = new ForageMaterial();
        BeanUtils.copyProperties(dto, material);
        String batchNo = generateBatchNo();
        material.setBatchNo(batchNo);
        material.setCreateTime(LocalDateTime.now());
        material.setUpdateTime(LocalDateTime.now());
        calculateAndSetStatus(material);
        materialMapper.insert(material);
    }

    @Transactional(rollbackFor = Exception.class)
    public void updateMaterial(ForageMaterialDTO dto) {
        ForageMaterial material = materialMapper.selectById(dto.getId());
        if (material == null) {
            throw new BusinessException("原料记录不存在");
        }
        BeanUtils.copyProperties(dto, material);
        material.setUpdateTime(LocalDateTime.now());
        calculateAndSetStatus(material);
        materialMapper.updateById(material);
    }

    @Transactional(rollbackFor = Exception.class)
    public void deleteMaterial(Long id) {
        ForageMaterial material = materialMapper.selectById(id);
        if (material == null) {
            throw new BusinessException("原料记录不存在");
        }
        
        Long lockCount = lockRecordMapper.selectCount(new LambdaQueryWrapper<MaterialLockRecord>()
                .eq(MaterialLockRecord::getMaterialId, id)
                .eq(MaterialLockRecord::getLockStatus, 1));
        if (lockCount > 0) {
            throw new BusinessException("该原料存在锁定记录，无法删除");
        }
        
        materialMapper.deleteById(id);
    }

    @Transactional(rollbackFor = Exception.class)
    public void lockMaterial(Long orderId, Long materialId, BigDecimal quantity, String remarks) {
        ForageMaterial material = materialMapper.selectById(materialId);
        if (material == null) {
            throw new BusinessException("原料不存在");
        }
        
        if (material.getStatus().equals(MaterialStatusEnum.OUT_OF_STOCK.getCode())) {
            throw new BusinessException("原料已缺货，无法锁定");
        }
        
        BigDecimal availableQuantity = material.getQuantity();
        if (availableQuantity.compareTo(quantity) < 0) {
            throw new BusinessException("原料库存不足，可用数量: " + availableQuantity);
        }
        
        MaterialLockRecord lockRecord = new MaterialLockRecord();
        lockRecord.setOrderId(orderId);
        lockRecord.setMaterialId(materialId);
        lockRecord.setLockQuantity(quantity);
        lockRecord.setLockStatus(1);
        lockRecord.setLockTime(LocalDateTime.now());
        lockRecord.setRemarks(remarks);
        lockRecord.setCreateTime(LocalDateTime.now());
        lockRecord.setUpdateTime(LocalDateTime.now());
        lockRecordMapper.insert(lockRecord);
        
        material.setQuantity(material.getQuantity().subtract(quantity));
        calculateAndSetStatus(material);
        materialMapper.updateById(material);
    }

    @Transactional(rollbackFor = Exception.class)
    public void unlockMaterial(Long orderId, Long materialId) {
        LambdaQueryWrapper<MaterialLockRecord> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(MaterialLockRecord::getOrderId, orderId)
               .eq(MaterialLockRecord::getMaterialId, materialId)
               .eq(MaterialLockRecord::getLockStatus, 1);
        
        List<MaterialLockRecord> lockRecords = lockRecordMapper.selectList(wrapper);
        for (MaterialLockRecord record : lockRecords) {
            record.setLockStatus(0);
            record.setUnlockTime(LocalDateTime.now());
            record.setUpdateTime(LocalDateTime.now());
            lockRecordMapper.updateById(record);
            
            ForageMaterial material = materialMapper.selectById(record.getMaterialId());
            if (material != null) {
                material.setQuantity(material.getQuantity().add(record.getLockQuantity()));
                calculateAndSetStatus(material);
                materialMapper.updateById(material);
            }
        }
    }

    @Transactional(rollbackFor = Exception.class)
    public void consumeLockedMaterial(Long orderId, Long materialId) {
        LambdaQueryWrapper<MaterialLockRecord> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(MaterialLockRecord::getOrderId, orderId)
               .eq(MaterialLockRecord::getMaterialId, materialId)
               .eq(MaterialLockRecord::getLockStatus, 1);
        
        MaterialLockRecord lockRecord = lockRecordMapper.selectOne(wrapper);
        if (lockRecord != null) {
            lockRecord.setLockStatus(2);
            lockRecord.setUpdateTime(LocalDateTime.now());
            lockRecordMapper.updateById(lockRecord);
        }
    }

    @Transactional(rollbackFor = Exception.class)
    public void updateMoistureWarning(Long id, Integer warningStatus) {
        ForageMaterial material = materialMapper.selectById(id);
        if (material == null) {
            throw new BusinessException("原料记录不存在");
        }
        material.setMoistureWarning(warningStatus);
        material.setUpdateTime(LocalDateTime.now());
        materialMapper.updateById(material);
    }

    private String generateBatchNo() {
        String dateStr = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        Long count = materialMapper.selectCount(new LambdaQueryWrapper<ForageMaterial>()
                .apply("DATE_FORMAT(create_time, '%Y%m%d') = {0}", dateStr));
        return "PC" + dateStr + String.format("%04d", count + 1);
    }

    private void calculateAndSetStatus(ForageMaterial material) {
        BigDecimal quantity = material.getQuantity();
        if (quantity.compareTo(BigDecimal.ZERO) <= 0) {
            material.setStatus(MaterialStatusEnum.OUT_OF_STOCK.getCode());
        } else if (quantity.compareTo(new BigDecimal("100")) < 0) {
            material.setStatus(MaterialStatusEnum.WARNING.getCode());
        } else {
            material.setStatus(MaterialStatusEnum.ADEQUATE.getCode());
        }
    }

    public List<MaterialLockRecord> getMaterialLockRecords(Long orderId) {
        return lockRecordMapper.selectList(new LambdaQueryWrapper<MaterialLockRecord>()
                .eq(MaterialLockRecord::getOrderId, orderId)
                .orderByDesc(MaterialLockRecord::getLockTime));
    }
}
