package com.spring.manufacturing.service.impl;

import cn.hutool.core.util.StrUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.spring.manufacturing.common.ResultCode;
import com.spring.manufacturing.dto.MaterialInboundDTO;
import com.spring.manufacturing.dto.MaterialQueryDTO;
import com.spring.manufacturing.entity.MaterialLockRecord;
import com.spring.manufacturing.entity.SpringMaterial;
import com.spring.manufacturing.exception.BusinessException;
import com.spring.manufacturing.mapper.MaterialLockRecordMapper;
import com.spring.manufacturing.mapper.SpringMaterialMapper;
import com.spring.manufacturing.service.SpringMaterialService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class SpringMaterialServiceImpl extends ServiceImpl<SpringMaterialMapper, SpringMaterial> implements SpringMaterialService {

    private final MaterialLockRecordMapper lockRecordMapper;
    private final RedisTemplate<String, Object> redisTemplate;

    private static final String MATERIAL_CACHE_KEY = "material:";
    private static final String WARNING_MATERIALS_KEY = "material:warning";

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void inboundMaterial(MaterialInboundDTO dto, Long operatorId) {
        SpringMaterial material = new SpringMaterial();
        material.setMaterialName(dto.getMaterialName());
        material.setMaterialBrand(dto.getMaterialBrand());
        material.setMaterialType(dto.getMaterialType());
        material.setSpecification(dto.getSpecification());
        material.setQuantity(dto.getQuantity());
        material.setLockedQuantity(BigDecimal.ZERO);
        material.setAvailableQuantity(dto.getQuantity());
        material.setUnit(dto.getUnit());
        material.setWarningQuantity(dto.getWarningQuantity());
        material.setIsHighToughness(dto.getIsHighToughness());
        material.setSupplier(dto.getSupplier());
        material.setIncomingDate(dto.getIncomingDate() != null ? dto.getIncomingDate() : LocalDateTime.now().toLocalDate());
        material.setExpireDate(dto.getExpireDate());
        material.setRemark(dto.getRemark());
        material.setInboundOperatorId(operatorId);
        material.setInboundTime(LocalDateTime.now());

        if (dto.getQuantity().compareTo(dto.getWarningQuantity()) <= 0) {
            material.setStatus("WARNING");
        } else {
            material.setStatus("NORMAL");
        }

        if (dto.getIsHighToughness() != null && dto.getIsHighToughness() == 1) {
            material.setMoistureProtectRemind("高韧性钢丝需注意防潮，存储于干燥通风环境，相对湿度控制在60%以下");
        }

        String batchNo = generateBatchNo(dto.getMaterialType(), dto.getMaterialBrand());
        material.setBatchNo(batchNo);
        material.setMaterialCode("MC-" + batchNo);

        save(material);
        clearMaterialCache();
    }

    @Override
    public IPage<SpringMaterial> queryMaterialPage(MaterialQueryDTO queryDTO) {
        Page<SpringMaterial> page = new Page<>(queryDTO.getPageNum(), queryDTO.getPageSize());
        LambdaQueryWrapper<SpringMaterial> wrapper = new LambdaQueryWrapper<>();

        if (StrUtil.isNotBlank(queryDTO.getMaterialBrand())) {
            wrapper.like(SpringMaterial::getMaterialBrand, queryDTO.getMaterialBrand());
        }
        if (StrUtil.isNotBlank(queryDTO.getMaterialType())) {
            wrapper.eq(SpringMaterial::getMaterialType, queryDTO.getMaterialType());
        }
        if (StrUtil.isNotBlank(queryDTO.getStatus())) {
            wrapper.eq(SpringMaterial::getStatus, queryDTO.getStatus());
        }
        if (StrUtil.isNotBlank(queryDTO.getSupplier())) {
            wrapper.like(SpringMaterial::getSupplier, queryDTO.getSupplier());
        }

        wrapper.orderByDesc(SpringMaterial::getInboundTime);
        return page(page, wrapper);
    }

    @Override
    @SuppressWarnings("unchecked")
    public List<SpringMaterial> getWarningMaterials() {
        Object cached = redisTemplate.opsForValue().get(WARNING_MATERIALS_KEY);
        if (cached != null) {
            return (List<SpringMaterial>) cached;
        }

        List<SpringMaterial> materials = list(new LambdaQueryWrapper<SpringMaterial>()
                .eq(SpringMaterial::getStatus, "WARNING")
                .orderByDesc(SpringMaterial::getInboundTime));

        redisTemplate.opsForValue().set(WARNING_MATERIALS_KEY, materials, 30, TimeUnit.MINUTES);
        return materials;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean lockMaterial(Long materialId, Long workOrderId, String workOrderNo,
                                BigDecimal lockQuantity, Long operatorId) {
        SpringMaterial material = getById(materialId);
        if (material == null) {
            throw new BusinessException(ResultCode.ERROR, "原料不存在");
        }

        if (material.getAvailableQuantity().compareTo(lockQuantity) < 0) {
            throw new BusinessException(ResultCode.MATERIAL_INSUFFICIENT,
                    "原料库存不足，可用：" + material.getAvailableQuantity() + material.getUnit());
        }

        material.setLockedQuantity(material.getLockedQuantity().add(lockQuantity));
        material.setAvailableQuantity(material.getQuantity().subtract(material.getLockedQuantity()));
        updateById(material);

        MaterialLockRecord lockRecord = new MaterialLockRecord();
        lockRecord.setMaterialId(materialId);
        lockRecord.setMaterialName(material.getMaterialName());
        lockRecord.setMaterialBrand(material.getMaterialBrand());
        lockRecord.setBatchNo(material.getBatchNo());
        lockRecord.setWorkOrderId(workOrderId);
        lockRecord.setWorkOrderNo(workOrderNo);
        lockRecord.setLockQuantity(lockQuantity);
        lockRecord.setUnitPrice(material.getUnitPrice() != null ? material.getUnitPrice() : BigDecimal.ZERO);
        lockRecord.setTotalAmount(lockRecord.getUnitPrice().multiply(lockQuantity));
        lockRecord.setLockStatus(1);
        lockRecord.setLockOperatorId(operatorId);
        lockRecord.setLockTime(LocalDateTime.now());
        lockRecordMapper.insert(lockRecord);

        clearMaterialCache();
        return true;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean releaseMaterial(Long materialId, Long workOrderId, Long operatorId) {
        MaterialLockRecord lockRecord = lockRecordMapper.selectOne(new LambdaQueryWrapper<MaterialLockRecord>()
                .eq(MaterialLockRecord::getMaterialId, materialId)
                .eq(MaterialLockRecord::getWorkOrderId, workOrderId)
                .eq(MaterialLockRecord::getLockStatus, 1)
                .last("LIMIT 1"));

        if (lockRecord == null) {
            return true;
        }

        SpringMaterial material = getById(materialId);
        if (material != null) {
            material.setLockedQuantity(material.getLockedQuantity().subtract(lockRecord.getLockQuantity()));
            material.setAvailableQuantity(material.getQuantity().subtract(material.getLockedQuantity()));
            updateById(material);
        }

        lockRecord.setLockStatus(0);
        lockRecord.setReleaseOperatorId(operatorId);
        lockRecord.setReleaseTime(LocalDateTime.now());
        lockRecordMapper.updateById(lockRecord);

        clearMaterialCache();
        return true;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean consumeMaterial(Long materialId, Long workOrderId, BigDecimal consumeQuantity, Long operatorId) {
        MaterialLockRecord lockRecord = lockRecordMapper.selectOne(new LambdaQueryWrapper<MaterialLockRecord>()
                .eq(MaterialLockRecord::getMaterialId, materialId)
                .eq(MaterialLockRecord::getWorkOrderId, workOrderId)
                .eq(MaterialLockRecord::getLockStatus, 1)
                .last("LIMIT 1"));

        if (lockRecord == null) {
            throw new BusinessException("该原料未为此工单锁定");
        }

        if (lockRecord.getLockQuantity().compareTo(consumeQuantity) < 0) {
            throw new BusinessException("锁定库存不足，无法消耗");
        }

        SpringMaterial material = getById(materialId);
        if (material == null) {
            throw new BusinessException("原料不存在");
        }

        material.setQuantity(material.getQuantity().subtract(consumeQuantity));
        material.setLockedQuantity(material.getLockedQuantity().subtract(consumeQuantity));
        material.setAvailableQuantity(material.getQuantity().subtract(material.getLockedQuantity()));

        if (material.getAvailableQuantity().compareTo(material.getWarningQuantity()) <= 0) {
            material.setStatus("WARNING");
        }
        updateById(material);

        BigDecimal remainingLock = lockRecord.getLockQuantity().subtract(consumeQuantity);
        if (remainingLock.compareTo(BigDecimal.ZERO) > 0) {
            lockRecord.setLockQuantity(remainingLock);
            lockRecordMapper.updateById(lockRecord);
        } else {
            lockRecord.setLockStatus(0);
            lockRecord.setReleaseOperatorId(operatorId);
            lockRecord.setReleaseTime(LocalDateTime.now());
            lockRecordMapper.updateById(lockRecord);
        }

        clearMaterialCache();
        return true;
    }

    private String generateBatchNo(String materialType, String materialBrand) {
        String typeCode = switch (materialType) {
            case "CARBON" -> "C";
            case "ALLOY" -> "A";
            case "ANTIRUST" -> "R";
            case "AUXILIARY" -> "X";
            default -> "U";
        };
        String brandCode = StrUtil.isNotBlank(materialBrand) ?
                StrUtil.subPre(materialBrand.replaceAll("[^a-zA-Z0-9]", ""), 3).toUpperCase() : "000";
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        int random = (int) (Math.random() * 1000);
        return typeCode + brandCode + timestamp + String.format("%03d", random);
    }

    private void clearMaterialCache() {
        redisTemplate.delete(WARNING_MATERIALS_KEY);
    }
}