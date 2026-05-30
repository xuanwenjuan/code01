package com.battery.shell.service;

import cn.hutool.core.util.IdUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.battery.shell.annotation.Log;
import com.battery.shell.dto.MaterialDTO;
import com.battery.shell.dto.MaterialQueryDTO;
import com.battery.shell.entity.Material;
import com.battery.shell.exception.BusinessException;
import com.battery.shell.mapper.MaterialMapper;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class MaterialService {

    private final MaterialMapper materialMapper;
    private final RedisTemplate<String, Object> redisTemplate;
    private final ObjectMapper objectMapper;

    private static final String MATERIAL_LOCK_PREFIX = "material:lock:";
    private static final String MATERIAL_CACHE_KEY = "material:page:";
    private static final long LOCK_EXPIRE_TIME = 3600;
    private static final long CACHE_EXPIRE_TIME = 1800;

    @Transactional(rollbackFor = Exception.class)
    @Log(value = "新增物料入库", module = "物料管理")
    public void addMaterial(MaterialDTO dto) {
        Material exist = materialMapper.selectOne(
                new LambdaQueryWrapper<Material>()
                        .eq(Material::getMaterialCode, dto.getMaterialCode())
        );
        if (exist != null) {
            throw new BusinessException("物料编码已存在");
        }

        Material material = new Material();
        BeanUtils.copyProperties(dto, material);
        material.setBatchNo(generateBatchNo());
        material.setInboundTime(LocalDateTime.now());
        updateMaterialStatus(material);
        materialMapper.insert(material);

        clearMaterialCache();
    }

    @Transactional(rollbackFor = Exception.class)
    @Log(value = "更新物料信息", module = "物料管理")
    public void updateMaterial(MaterialDTO dto) {
        Material material = materialMapper.selectById(dto.getId());
        if (material == null) {
            throw new BusinessException("物料不存在");
        }

        if (!material.getMaterialCode().equals(dto.getMaterialCode())) {
            Material exist = materialMapper.selectOne(
                    new LambdaQueryWrapper<Material>()
                            .eq(Material::getMaterialCode, dto.getMaterialCode())
            );
            if (exist != null) {
                throw new BusinessException("物料编码已存在");
            }
        }

        BeanUtils.copyProperties(dto, material);
        updateMaterialStatus(material);
        materialMapper.updateById(material);

        clearMaterialCache();
    }

    @Transactional(rollbackFor = Exception.class)
    @Log(value = "删除物料", module = "物料管理")
    public void deleteMaterial(Long id) {
        Material material = materialMapper.selectById(id);
        if (material == null) {
            throw new BusinessException("物料不存在");
        }
        if (material.getStockQuantity().compareTo(BigDecimal.ZERO) > 0) {
            throw new BusinessException("该物料还有库存，无法删除");
        }
        materialMapper.deleteById(id);
        clearMaterialCache();
    }

    public Material getMaterialById(Long id) {
        return materialMapper.selectById(id);
    }

    @SuppressWarnings("unchecked")
    public IPage<Material> queryMaterialPage(MaterialQueryDTO queryDTO) {
        String cacheKey = MATERIAL_CACHE_KEY + queryDTO.hashCode();

        try {
            Object cachedData = redisTemplate.opsForValue().get(cacheKey);
            if (cachedData != null) {
                return objectMapper.convertValue(cachedData, new TypeReference<IPage<Material>>() {});
            }
        } catch (Exception e) {
        }

        LambdaQueryWrapper<Material> wrapper = new LambdaQueryWrapper<>();

        if (queryDTO.getMaterialCode() != null && !queryDTO.getMaterialCode().isEmpty()) {
            wrapper.like(Material::getMaterialCode, queryDTO.getMaterialCode());
        }
        if (queryDTO.getMaterialName() != null && !queryDTO.getMaterialName().isEmpty()) {
            wrapper.like(Material::getMaterialName, queryDTO.getMaterialName());
        }
        if (queryDTO.getMaterialType() != null && !queryDTO.getMaterialType().isEmpty()) {
            wrapper.eq(Material::getMaterialType, queryDTO.getMaterialType());
        }
        if (queryDTO.getStatus() != null && !queryDTO.getStatus().isEmpty()) {
            wrapper.eq(Material::getStatus, queryDTO.getStatus());
        }
        if (queryDTO.getIsOxidizable() != null) {
            wrapper.eq(Material::getIsOxidizable, queryDTO.getIsOxidizable());
        }
        if (queryDTO.getMinStock() != null) {
            wrapper.ge(Material::getStockQuantity, queryDTO.getMinStock());
        }
        if (queryDTO.getMaxStock() != null) {
            wrapper.le(Material::getStockQuantity, queryDTO.getMaxStock());
        }
        if (queryDTO.getStartInboundTime() != null) {
            wrapper.ge(Material::getInboundTime, queryDTO.getStartInboundTime());
        }
        if (queryDTO.getEndInboundTime() != null) {
            wrapper.le(Material::getInboundTime, queryDTO.getEndInboundTime());
        }

        wrapper.orderByDesc(Material::getCreateTime);

        Page<Material> page = new Page<>(queryDTO.getPageNum(), queryDTO.getPageSize());
        IPage<Material> result = materialMapper.selectPage(page, wrapper);

        try {
            redisTemplate.opsForValue().set(cacheKey, result, CACHE_EXPIRE_TIME, TimeUnit.SECONDS);
        } catch (Exception e) {
        }

        return result;
    }

    public List<Material> getMaterialList(String materialType, String status) {
        LambdaQueryWrapper<Material> wrapper = new LambdaQueryWrapper<>();
        if (materialType != null && !materialType.isEmpty()) {
            wrapper.eq(Material::getMaterialType, materialType);
        }
        if (status != null && !status.isEmpty()) {
            wrapper.eq(Material::getStatus, status);
        }
        wrapper.orderByDesc(Material::getCreateTime);
        return materialMapper.selectList(wrapper);
    }

    @Transactional(rollbackFor = Exception.class)
    @Log(value = "更新物料库存", module = "物料管理")
    public void updateStock(Long id, BigDecimal quantity) {
        Material material = materialMapper.selectById(id);
        if (material == null) {
            throw new BusinessException("物料不存在");
        }
        material.setStockQuantity(material.getStockQuantity().add(quantity));
        updateMaterialStatus(material);
        materialMapper.updateById(material);
        clearMaterialCache();
    }

    @Transactional(rollbackFor = Exception.class)
    @Log(value = "锁定物料库存", module = "物料管理")
    public boolean lockStock(Long materialId, BigDecimal quantity, Long orderId) {
        String lockKey = MATERIAL_LOCK_PREFIX + materialId + ":" + orderId;

        Material material = materialMapper.selectById(materialId);
        if (material == null) {
            throw new BusinessException("物料不存在");
        }

        if (material.getStockQuantity().compareTo(quantity) < 0) {
            throw new BusinessException("物料库存不足");
        }

        material.setStockQuantity(material.getStockQuantity().subtract(quantity));
        updateMaterialStatus(material);
        materialMapper.updateById(material);

        try {
            redisTemplate.opsForValue().set(lockKey, quantity, LOCK_EXPIRE_TIME, TimeUnit.SECONDS);
        } catch (Exception e) {
        }

        clearMaterialCache();
        return true;
    }

    @Transactional(rollbackFor = Exception.class)
    @Log(value = "释放物料库存", module = "物料管理")
    public boolean unlockStock(Long materialId, BigDecimal quantity, Long orderId) {
        String lockKey = MATERIAL_LOCK_PREFIX + materialId + ":" + orderId;

        Material material = materialMapper.selectById(materialId);
        if (material == null) {
            throw new BusinessException("物料不存在");
        }

        material.setStockQuantity(material.getStockQuantity().add(quantity));
        updateMaterialStatus(material);
        materialMapper.updateById(material);

        try {
            redisTemplate.delete(lockKey);
        } catch (Exception e) {
        }

        clearMaterialCache();
        return true;
    }

    private void updateMaterialStatus(Material material) {
        if ("STOP".equals(material.getStatus())) {
            return;
        }
        if (material.getStockQuantity().compareTo(material.getWarningQuantity()) <= 0) {
            material.setStatus("WARNING");
        } else {
            material.setStatus("ENOUGH");
        }
    }

    private String generateBatchNo() {
        return "BAT" + IdUtil.getSnowflakeNextIdStr();
    }

    @SuppressWarnings("unchecked")
    public List<Material> getExpiringMaterials() {
        String warningKey = "material:warning:list";
        try {
            Object cachedData = redisTemplate.opsForValue().get(warningKey);
            if (cachedData != null) {
                return objectMapper.convertValue(cachedData, new TypeReference<List<Material>>() {});
            }
        } catch (Exception e) {
        }

        LocalDateTime expireDate = LocalDateTime.now().minusDays(7);
        List<Material> materials = materialMapper.selectList(
                new LambdaQueryWrapper<Material>()
                        .eq(Material::getIsOxidizable, 1)
                        .le(Material::getInboundTime, expireDate)
                        .ne(Material::getStatus, "STOP")
        );

        try {
            redisTemplate.opsForValue().set(warningKey, materials, 300, TimeUnit.SECONDS);
        } catch (Exception e) {
        }

        return materials;
    }

    private void clearMaterialCache() {
        try {
            List<String> types = List.of("ALUMINUM", "STEEL", "FILM", "SEAL", "");
            List<String> statuses = List.of("ENOUGH", "WARNING", "STOP", "");
            List<String> keysToDelete = new java.util.ArrayList<>();
            for (String type : types) {
                for (String status : statuses) {
                    keysToDelete.add("material:list:" + type + ":" + status);
                }
            }
            keysToDelete.add("material:warning:list");
            redisTemplate.delete(keysToDelete);
        } catch (Exception e) {
        }
    }
}
