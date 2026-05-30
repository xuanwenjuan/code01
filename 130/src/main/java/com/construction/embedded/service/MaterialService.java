package com.construction.embedded.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.construction.embedded.dto.MaterialDTO;
import com.construction.embedded.dto.MaterialQueryDTO;
import com.construction.embedded.entity.Material;
import com.construction.embedded.exception.BusinessException;
import com.construction.embedded.mapper.MaterialMapper;
import com.construction.embedded.util.UserContext;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
public class MaterialService {

    private static final String MATERIAL_CACHE_PREFIX = "material:";

    @Autowired
    private MaterialMapper materialMapper;

    @Autowired
    private StringRedisTemplate stringRedisTemplate;

    @Autowired
    private ProductionLogService productionLogService;

    public IPage<Material> queryPage(MaterialQueryDTO queryDTO) {
        LambdaQueryWrapper<Material> wrapper = new LambdaQueryWrapper<>();
        
        if (queryDTO.getMaterialType() != null && !queryDTO.getMaterialType().isEmpty()) {
            wrapper.eq(Material::getMaterialType, queryDTO.getMaterialType());
        }
        if (queryDTO.getStatus() != null && !queryDTO.getStatus().isEmpty()) {
            wrapper.eq(Material::getStatus, queryDTO.getStatus());
        }
        if (queryDTO.getMaterialName() != null && !queryDTO.getMaterialName().isEmpty()) {
            wrapper.like(Material::getMaterialName, queryDTO.getMaterialName());
        }
        if (queryDTO.getSpecification() != null && !queryDTO.getSpecification().isEmpty()) {
            wrapper.like(Material::getSpecification, queryDTO.getSpecification());
        }
        if (queryDTO.getBatchCode() != null && !queryDTO.getBatchCode().isEmpty()) {
            wrapper.like(Material::getBatchCode, queryDTO.getBatchCode());
        }
        
        wrapper.orderByDesc(Material::getCreateTime);
        return materialMapper.selectPage(new Page<>(queryDTO.getPageNum(), queryDTO.getPageSize()), wrapper);
    }

    public Material getById(Long id) {
        String cacheKey = MATERIAL_CACHE_PREFIX + id;
        String cached = stringRedisTemplate.opsForValue().get(cacheKey);
        if (cached != null) {
            return parseMaterialFromCache(cached);
        }
        
        Material material = materialMapper.selectById(id);
        if (material != null) {
            stringRedisTemplate.opsForValue().set(cacheKey, serializeMaterial(material), 30, TimeUnit.MINUTES);
        }
        return material;
    }

    @Transactional(rollbackFor = Exception.class)
    public void addMaterial(MaterialDTO dto) {
        Material material = new Material();
        BeanUtils.copyProperties(dto, material);
        
        String batchCode = generateBatchCode(dto.getMaterialType());
        material.setBatchCode(batchCode);
        material.setInDate(LocalDate.now());
        material.setStatus("NORMAL");
        material.setRustWarningStatus(0);
        material.setLockedQuantity(BigDecimal.ZERO);
        if (material.getUnit() == null) {
            material.setUnit("kg");
        }
        
        materialMapper.insert(material);
        
        productionLogService.saveLog(null, "MATERIAL_IN", 
            "原料入库：" + material.getMaterialName() + "，数量：" + material.getQuantity(), 
            null, null);
        
        clearMaterialCache(material.getId());
    }

    @Transactional(rollbackFor = Exception.class)
    public void updateMaterial(MaterialDTO dto) {
        Material existing = materialMapper.selectById(dto.getId());
        if (existing == null) {
            throw new BusinessException("原料不存在");
        }
        
        Material material = new Material();
        BeanUtils.copyProperties(dto, material);
        materialMapper.updateById(material);
        
        productionLogService.saveLog(null, "MATERIAL_UPDATE", 
            "更新原料信息：" + material.getMaterialName(), 
            null, null);
        
        clearMaterialCache(dto.getId());
    }

    @Transactional(rollbackFor = Exception.class)
    public void deleteMaterial(Long id) {
        Material material = materialMapper.selectById(id);
        if (material == null) {
            throw new BusinessException("原料不存在");
        }
        if (material.getLockedQuantity() != null && material.getLockedQuantity().compareTo(BigDecimal.ZERO) > 0) {
            throw new BusinessException("该原料有锁定库存，无法删除");
        }
        
        materialMapper.deleteById(id);
        
        productionLogService.saveLog(null, "MATERIAL_DELETE", 
            "删除原料：" + material.getMaterialName(), 
            null, null);
        
        clearMaterialCache(id);
    }

    @Transactional(rollbackFor = Exception.class)
    public void updateStock(Long id, BigDecimal quantity) {
        Material material = materialMapper.selectById(id);
        if (material == null) {
            throw new BusinessException("原料不存在");
        }
        material.setQuantity(quantity);
        updateMaterialStatus(material);
        materialMapper.updateById(material);
        
        productionLogService.saveLog(null, "STOCK_UPDATE", 
            "更新库存：" + material.getMaterialName() + "，数量：" + quantity, 
            null, null);
        
        clearMaterialCache(id);
    }

    @Transactional(rollbackFor = Exception.class)
    public void adjustStock(Long id, BigDecimal amount) {
        Material material = materialMapper.selectById(id);
        if (material == null) {
            throw new BusinessException("原料不存在");
        }
        BigDecimal newQuantity = material.getQuantity().add(amount);
        if (newQuantity.compareTo(BigDecimal.ZERO) < 0) {
            throw new BusinessException("库存不足");
        }
        material.setQuantity(newQuantity);
        updateMaterialStatus(material);
        materialMapper.updateById(material);
        
        String operation = amount.compareTo(BigDecimal.ZERO) > 0 ? "入库" : "出库";
        productionLogService.saveLog(null, "STOCK_ADJUST", 
            operation + "：" + material.getMaterialName() + "，数量：" + amount.abs(), 
            null, null);
        
        clearMaterialCache(id);
    }

    @Transactional(rollbackFor = Exception.class)
    public void lockStock(Long materialId, BigDecimal lockQuantity) {
        Material material = materialMapper.selectById(materialId);
        if (material == null) {
            throw new BusinessException("原料不存在");
        }
        
        BigDecimal availableQuantity = material.getQuantity().subtract(
            material.getLockedQuantity() != null ? material.getLockedQuantity() : BigDecimal.ZERO
        );
        
        if (availableQuantity.compareTo(lockQuantity) < 0) {
            throw new BusinessException("可用库存不足，可用：" + availableQuantity);
        }
        
        material.setLockedQuantity(
            (material.getLockedQuantity() != null ? material.getLockedQuantity() : BigDecimal.ZERO)
                .add(lockQuantity)
        );
        materialMapper.updateById(material);
        
        clearMaterialCache(materialId);
    }

    @Transactional(rollbackFor = Exception.class)
    public void unlockStock(Long materialId, BigDecimal unlockQuantity) {
        Material material = materialMapper.selectById(materialId);
        if (material == null) {
            throw new BusinessException("原料不存在");
        }
        
        BigDecimal newLockedQuantity = (material.getLockedQuantity() != null ? 
            material.getLockedQuantity() : BigDecimal.ZERO).subtract(unlockQuantity);
        
        if (newLockedQuantity.compareTo(BigDecimal.ZERO) < 0) {
            newLockedQuantity = BigDecimal.ZERO;
        }
        
        material.setLockedQuantity(newLockedQuantity);
        materialMapper.updateById(material);
        
        clearMaterialCache(materialId);
    }

    @Transactional(rollbackFor = Exception.class)
    public void consumeStock(Long materialId, BigDecimal consumeQuantity) {
        Material material = materialMapper.selectById(materialId);
        if (material == null) {
            throw new BusinessException("原料不存在");
        }
        
        if (material.getQuantity().compareTo(consumeQuantity) < 0) {
            throw new BusinessException("库存不足");
        }
        
        material.setQuantity(material.getQuantity().subtract(consumeQuantity));
        
        if (material.getLockedQuantity() != null && material.getLockedQuantity().compareTo(consumeQuantity) >= 0) {
            material.setLockedQuantity(material.getLockedQuantity().subtract(consumeQuantity));
        }
        
        updateMaterialStatus(material);
        materialMapper.updateById(material);
        
        clearMaterialCache(materialId);
    }

    private void updateMaterialStatus(Material material) {
        if (material.getQuantity().compareTo(BigDecimal.ZERO) <= 0) {
            material.setStatus("STOP");
        } else if (material.getWarningQuantity() != null && 
                   material.getQuantity().compareTo(material.getWarningQuantity()) <= 0) {
            material.setStatus("WARNING");
        } else {
            material.setStatus("NORMAL");
        }
    }

    @Transactional(rollbackFor = Exception.class)
    public void checkRustWarning() {
        LambdaQueryWrapper<Material> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Material::getIsHumidEnv, 1)
               .eq(Material::getRustWarningStatus, 0);
        
        var materials = materialMapper.selectList(wrapper);
        LocalDate today = LocalDate.now();
        
        for (Material material : materials) {
            if (material.getInDate() != null && material.getRustWarningDays() != null) {
                LocalDate warningDate = material.getInDate().plusDays(material.getRustWarningDays());
                if (today.isAfter(warningDate) || today.isEqual(warningDate)) {
                    material.setRustWarningStatus(1);
                    materialMapper.updateById(material);
                    clearMaterialCache(material.getId());
                }
            }
        }
    }

    public IPage<Material> getRustWarningList(Integer pageNum, Integer pageSize) {
        LambdaQueryWrapper<Material> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Material::getRustWarningStatus, 1)
               .orderByDesc(Material::getInDate);
        return materialMapper.selectPage(new Page<>(pageNum, pageSize), wrapper);
    }

    @Transactional(rollbackFor = Exception.class)
    public void clearRustWarning(Long id) {
        Material material = materialMapper.selectById(id);
        if (material == null) {
            throw new BusinessException("原料不存在");
        }
        material.setRustWarningStatus(0);
        material.setInDate(LocalDate.now());
        materialMapper.updateById(material);
        
        productionLogService.saveLog(null, "RUST_WARNING_CLEAR", 
            "清除锈蚀预警：" + material.getMaterialName(), 
            null, null);
        
        clearMaterialCache(id);
    }

    public IPage<Material> getLowStockList(Integer pageNum, Integer pageSize) {
        LambdaQueryWrapper<Material> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Material::getStatus, "WARNING")
               .orderByAsc(Material::getQuantity);
        return materialMapper.selectPage(new Page<>(pageNum, pageSize), wrapper);
    }

    private String generateBatchCode(String materialType) {
        String dateStr = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String uuid = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        String typePrefix = materialType != null ? 
            materialType.substring(0, Math.min(2, materialType.length())).toUpperCase() : "MT";
        return typePrefix + "-" + dateStr + "-" + uuid;
    }

    private void clearMaterialCache(Long id) {
        stringRedisTemplate.delete(MATERIAL_CACHE_PREFIX + id);
    }

    private String serializeMaterial(Material material) {
        return material.getId() + "," + material.getMaterialName() + "," + 
               material.getQuantity() + "," + material.getLockedQuantity() + "," + 
               material.getStatus();
    }

    private Material parseMaterialFromCache(String cache) {
        String[] parts = cache.split(",");
        Material material = new Material();
        material.setId(Long.parseLong(parts[0]));
        material.setMaterialName(parts[1]);
        material.setQuantity(new BigDecimal(parts[2]));
        material.setLockedQuantity(new BigDecimal(parts[3]));
        material.setStatus(parts[4]);
        return material;
    }
}
