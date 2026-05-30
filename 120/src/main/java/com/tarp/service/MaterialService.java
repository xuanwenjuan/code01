package com.tarp.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tarp.dto.MaterialQueryDTO;
import com.tarp.entity.Material;
import com.tarp.exception.BusinessException;
import com.tarp.mapper.MaterialMapper;
import com.tarp.util.RedisUtil;
import com.tarp.util.StatusUtil;
import com.tarp.vo.MaterialVO;
import com.tarp.vo.PageVO;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MaterialService {

    private static final String MATERIAL_LOCK_KEY = "tarp:material:lock:";
    private static final String MATERIAL_STOCK_KEY = "tarp:material:stock:";
    private static final long LOCK_EXPIRE_TIME = 30;

    private final MaterialMapper materialMapper;
    private final RedisUtil redisUtil;
    private final ObjectMapper objectMapper;

    public PageVO<MaterialVO> queryByConditions(MaterialQueryDTO queryDTO) {
        Page<Material> page = new Page<>(queryDTO.getPageNum(), queryDTO.getPageSize());
        LambdaQueryWrapper<Material> wrapper = buildQueryWrapper(queryDTO);
        Page<Material> materialPage = materialMapper.selectPage(page, wrapper);

        List<MaterialVO> voList = materialPage.getRecords().stream()
                .map(this::convertToVO)
                .collect(Collectors.toList());

        return new PageVO<>(materialPage.getTotal(), voList, queryDTO.getPageNum(), queryDTO.getPageSize());
    }

    private LambdaQueryWrapper<Material> buildQueryWrapper(MaterialQueryDTO queryDTO) {
        LambdaQueryWrapper<Material> wrapper = new LambdaQueryWrapper<>();

        if (queryDTO.getKeyword() != null && !queryDTO.getKeyword().isEmpty()) {
            wrapper.and(w -> w.like(Material::getMaterialName, queryDTO.getKeyword())
                    .or()
                    .like(Material::getMaterialCode, queryDTO.getKeyword())
                    .or()
                    .like(Material::getBatchNo, queryDTO.getKeyword()));
        }

        if (queryDTO.getMaterialType() != null && !queryDTO.getMaterialType().isEmpty()) {
            wrapper.eq(Material::getMaterialType, queryDTO.getMaterialType());
        }

        if (queryDTO.getStatus() != null) {
            wrapper.eq(Material::getStatus, queryDTO.getStatus());
        }

        if (queryDTO.getOrigin() != null && !queryDTO.getOrigin().isEmpty()) {
            wrapper.eq(Material::getOrigin, queryDTO.getOrigin());
        }

        wrapper.orderByDesc(Material::getCreateTime);
        return wrapper;
    }

    public MaterialVO getById(Long id) {
        Material material = materialMapper.selectById(id);
        if (material == null) {
            throw new BusinessException("材料不存在");
        }
        return convertToVO(material);
    }

    @Transactional(rollbackFor = Exception.class)
    public void addMaterial(Material material) {
        updateMaterialStatus(material);
        materialMapper.insert(material);
        evictMaterialCache(material.getId());
    }

    @Transactional(rollbackFor = Exception.class)
    public void updateMaterial(Material material) {
        Material exist = materialMapper.selectById(material.getId());
        if (exist == null) {
            throw new BusinessException("材料不存在");
        }
        updateMaterialStatus(material);
        materialMapper.updateById(material);
        evictMaterialCache(material.getId());
    }

    @Transactional(rollbackFor = Exception.class)
    public void deleteMaterial(Long id) {
        materialMapper.deleteById(id);
        evictMaterialCache(id);
    }

    public List<MaterialVO> getAvailableMaterials() {
        List<Material> materials = materialMapper.selectList(
                new LambdaQueryWrapper<Material>()
                        .gt(Material::getStockQuantity, 0)
                        .orderByAsc(Material::getMaterialName)
        );
        return materials.stream().map(this::convertToVO).collect(Collectors.toList());
    }

    public List<MaterialVO> getExpiringOilMaterials() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime thirtyDaysLater = now.plusDays(30);
        List<Material> materials = materialMapper.selectList(
                new LambdaQueryWrapper<Material>()
                        .eq(Material::getIsOil, 1)
                        .le(Material::getExpireTime, thirtyDaysLater)
                        .gt(Material::getExpireTime, now)
        );
        return materials.stream().map(this::convertToVO).collect(Collectors.toList());
    }

    @Transactional(rollbackFor = Exception.class)
    public void updateStock(Long id, BigDecimal quantity) {
        Material material = materialMapper.selectById(id);
        if (material == null) {
            throw new BusinessException("材料不存在");
        }
        material.setStockQuantity(material.getStockQuantity().add(quantity));
        updateMaterialStatus(material);
        materialMapper.updateById(material);
        evictMaterialCache(id);
    }

    @Transactional(rollbackFor = Exception.class)
    public boolean lockStock(Long materialId, BigDecimal quantity, String lockKey) {
        String lockRedisKey = MATERIAL_LOCK_KEY + lockKey;

        Boolean locked = redisUtil.hmHasKey(lockRedisKey, materialId.toString());
        if (Boolean.TRUE.equals(locked)) {
            return false;
        }

        Material material = materialMapper.selectById(materialId);
        if (material == null) {
            throw new BusinessException("材料不存在");
        }

        if (material.getStockQuantity().compareTo(quantity) < 0) {
            return false;
        }

        material.setStockQuantity(material.getStockQuantity().subtract(quantity));
        updateMaterialStatus(material);
        materialMapper.updateById(material);

        redisUtil.hmSet(lockRedisKey, Map.of(materialId.toString(), quantity.toString()));
        redisUtil.expire(lockRedisKey, LOCK_EXPIRE_TIME, TimeUnit.MINUTES);

        evictMaterialCache(materialId);
        return true;
    }

    @Transactional(rollbackFor = Exception.class)
    public void unlockStock(String lockKey) {
        String lockRedisKey = MATERIAL_LOCK_KEY + lockKey;
        Map<Object, Object> lockedMaterials = redisUtil.hmGetAll(lockRedisKey);

        for (Map.Entry<Object, Object> entry : lockedMaterials.entrySet()) {
            Long materialId = Long.parseLong(entry.getKey().toString());
            BigDecimal quantity = new BigDecimal(entry.getValue().toString());

            Material material = materialMapper.selectById(materialId);
            if (material != null) {
                material.setStockQuantity(material.getStockQuantity().add(quantity));
                updateMaterialStatus(material);
                materialMapper.updateById(material);
                evictMaterialCache(materialId);
            }
        }

        redisUtil.delete(lockRedisKey);
    }

    public void confirmStockLock(String lockKey) {
        String lockRedisKey = MATERIAL_LOCK_KEY + lockKey;
        redisUtil.delete(lockRedisKey);
    }

    private void updateMaterialStatus(Material material) {
        if (material.getStockQuantity() == null) {
            material.setStockQuantity(BigDecimal.ZERO);
        }
        if (material.getWarningQuantity() == null) {
            material.setWarningQuantity(BigDecimal.TEN);
        }
        if (material.getStockQuantity().compareTo(BigDecimal.ZERO) == 0) {
            material.setStatus(0);
        } else if (material.getStockQuantity().compareTo(material.getWarningQuantity()) <= 0) {
            material.setStatus(1);
        } else {
            material.setStatus(2);
        }
    }

    private void evictMaterialCache(Long materialId) {
        redisUtil.delete(MATERIAL_STOCK_KEY + materialId);
    }

    private MaterialVO convertToVO(Material material) {
        MaterialVO vo = new MaterialVO();
        BeanUtils.copyProperties(material, vo);
        vo.setStatusName(StatusUtil.getMaterialStatusName(material.getStatus()));
        return vo;
    }
}
