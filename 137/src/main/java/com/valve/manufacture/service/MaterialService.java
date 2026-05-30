package com.valve.manufacture.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.valve.manufacture.dto.MaterialQueryDTO;
import com.valve.manufacture.entity.Material;
import com.valve.manufacture.entity.MaterialBatch;
import com.valve.manufacture.exception.BusinessException;
import com.valve.manufacture.mapper.MaterialMapper;
import com.valve.manufacture.util.RedisUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class MaterialService extends ServiceImpl<MaterialMapper, Material> {

    private final MaterialBatchService materialBatchService;
    private final RedisUtil redisUtil;
    private static final String MATERIAL_CACHE_KEY = "material:";
    private static final String MATERIAL_LIST_CACHE_KEY = "material:list";

    @Transactional(rollbackFor = Exception.class)
    public Material create(Material material) {
        Material exist = getOne(new LambdaQueryWrapper<Material>()
                .eq(Material::getMaterialCode, material.getMaterialCode())
                .eq(Material::getDeleted, 0));
        if (exist != null) {
            throw new BusinessException("原料编码已存在");
        }
        if (material.getStatus() == null) {
            material.setStatus(2);
        }
        if (material.getTotalQuantity() == null) {
            material.setTotalQuantity(BigDecimal.ZERO);
        }
        if (material.getWarningQuantity() == null) {
            material.setWarningQuantity(BigDecimal.ZERO);
        }
        updateMaterialStatus(material);
        save(material);
        clearMaterialCache();
        return material;
    }

    @Transactional(rollbackFor = Exception.class)
    public Material update(Long id, Material material) {
        Material exist = getById(id);
        if (exist == null) {
            throw new BusinessException("原料不存在");
        }
        material.setId(id);
        updateMaterialStatus(material);
        updateById(material);
        clearMaterialCache(id);
        return getById(id);
    }

    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        Material material = getById(id);
        if (material == null) {
            throw new BusinessException("原料不存在");
        }
        Long batchCount = materialBatchService.count(new LambdaQueryWrapper<MaterialBatch>()
                .eq(MaterialBatch::getMaterialId, id)
                .eq(MaterialBatch::getStatus, 1)
                .eq(MaterialBatch::getDeleted, 0));
        if (batchCount > 0) {
            throw new BusinessException("存在可用批次，无法删除");
        }
        removeById(id);
        clearMaterialCache(id);
    }

    private void updateMaterialStatus(Material material) {
        if (material.getTotalQuantity() == null) {
            return;
        }
        BigDecimal warningQty = material.getWarningQuantity() != null ?
                material.getWarningQuantity() : BigDecimal.ZERO;

        if (material.getTotalQuantity().compareTo(BigDecimal.ZERO) <= 0) {
            material.setStatus(0);
        } else if (material.getTotalQuantity().compareTo(warningQty) <= 0) {
            material.setStatus(1);
        } else {
            material.setStatus(2);
        }
    }

    public List<Material> getRustRemindList() {
        LocalDate today = LocalDate.now();
        List<Material> materials = list(new LambdaQueryWrapper<Material>()
                .eq(Material::getIsRustProne, 1)
                .eq(Material::getDeleted, 0));

        return materials.stream()
                .filter(m -> {
                    if (m.getLastRustCheck() == null || m.getRustRemindDays() == null) {
                        return true;
                    }
                    LocalDate remindDate = m.getLastRustCheck().plusDays(m.getRustRemindDays());
                    return !today.isBefore(remindDate);
                })
                .toList();
    }

    @Transactional(rollbackFor = Exception.class)
    public void updateStock(Long materialId, BigDecimal quantity, String batchNo, String operator) {
        Material material = getById(materialId);
        if (material == null) {
            throw new BusinessException("原料不存在");
        }
        BigDecimal newQuantity = material.getTotalQuantity().add(quantity);
        if (newQuantity.compareTo(BigDecimal.ZERO) < 0) {
            throw new BusinessException("库存不足");
        }
        material.setTotalQuantity(newQuantity);
        updateMaterialStatus(material);
        updateById(material);
        clearMaterialCache(materialId);
    }

    @Override
    public Material getById(Long id) {
        String cacheKey = MATERIAL_CACHE_KEY + id;
        Object cached = redisUtil.get(cacheKey);
        if (cached != null) {
            return (Material) cached;
        }
        Material material = super.getById(id);
        if (material != null) {
            redisUtil.set(cacheKey, material, 10, TimeUnit.MINUTES);
        }
        return material;
    }

    public Page<Material> queryByConditions(Integer current, Integer size, MaterialQueryDTO queryDTO) {
        LambdaQueryWrapper<Material> wrapper = new LambdaQueryWrapper<>();

        if (StringUtils.hasText(queryDTO.getKeyword())) {
            wrapper.and(w -> w.like(Material::getMaterialCode, queryDTO.getKeyword())
                    .or().like(Material::getMaterialName, queryDTO.getKeyword())
                    .or().like(Material::getSpecification, queryDTO.getKeyword()));
        }

        if (StringUtils.hasText(queryDTO.getMaterialCode())) {
            wrapper.like(Material::getMaterialCode, queryDTO.getMaterialCode());
        }

        if (StringUtils.hasText(queryDTO.getMaterialName())) {
            wrapper.like(Material::getMaterialName, queryDTO.getMaterialName());
        }

        if (StringUtils.hasText(queryDTO.getMaterialType())) {
            wrapper.eq(Material::getMaterialType, queryDTO.getMaterialType());
        }

        if (StringUtils.hasText(queryDTO.getMaterial())) {
            wrapper.like(Material::getMaterial, queryDTO.getMaterial());
        }

        if (StringUtils.hasText(queryDTO.getSpecification())) {
            wrapper.like(Material::getSpecification, queryDTO.getSpecification());
        }

        if (queryDTO.getStatus() != null) {
            wrapper.eq(Material::getStatus, queryDTO.getStatus());
        }

        if (queryDTO.getIsRustProne() != null) {
            wrapper.eq(Material::getIsRustProne, queryDTO.getIsRustProne());
        }

        if (queryDTO.getMinQuantity() != null) {
            wrapper.ge(Material::getTotalQuantity, queryDTO.getMinQuantity());
        }

        if (queryDTO.getMaxQuantity() != null) {
            wrapper.le(Material::getTotalQuantity, queryDTO.getMaxQuantity());
        }

        if (queryDTO.getStartDate() != null) {
            wrapper.ge(Material::getCreateTime, queryDTO.getStartDate().atStartOfDay());
        }

        if (queryDTO.getEndDate() != null) {
            wrapper.le(Material::getCreateTime, queryDTO.getEndDate().atTime(23, 59, 59));
        }

        wrapper.eq(Material::getDeleted, 0);

        if (StringUtils.hasText(queryDTO.getSortField())) {
            boolean isAsc = "asc".equalsIgnoreCase(queryDTO.getSortOrder());
            switch (queryDTO.getSortField()) {
                case "materialCode":
                    if (isAsc) {
                        wrapper.orderByAsc(Material::getMaterialCode);
                    } else {
                        wrapper.orderByDesc(Material::getMaterialCode);
                    }
                    break;
                case "totalQuantity":
                    if (isAsc) {
                        wrapper.orderByAsc(Material::getTotalQuantity);
                    } else {
                        wrapper.orderByDesc(Material::getTotalQuantity);
                    }
                    break;
                case "updateTime":
                    if (isAsc) {
                        wrapper.orderByAsc(Material::getUpdateTime);
                    } else {
                        wrapper.orderByDesc(Material::getUpdateTime);
                    }
                    break;
                default:
                    if (isAsc) {
                        wrapper.orderByAsc(Material::getCreateTime);
                    } else {
                        wrapper.orderByDesc(Material::getCreateTime);
                    }
            }
        } else {
            wrapper.orderByDesc(Material::getCreateTime);
        }

        return page(new Page<>(current, size), wrapper);
    }

    private void clearMaterialCache(Long id) {
        if (id != null) {
            redisUtil.delete(MATERIAL_CACHE_KEY + id);
        }
        redisUtil.delete(MATERIAL_LIST_CACHE_KEY);
    }

    private void clearMaterialCache() {
        redisUtil.delete(MATERIAL_LIST_CACHE_KEY);
    }

    @Transactional(rollbackFor = Exception.class)
    public void updateRustCheck(Long id, LocalDate checkDate) {
        Material material = getById(id);
        if (material == null) {
            throw new BusinessException("原料不存在");
        }
        material.setLastRustCheck(checkDate);
        updateById(material);
        clearMaterialCache(id);
    }

    public List<Material> getLowStockMaterials() {
        return list(new LambdaQueryWrapper<Material>()
                .in(Material::getStatus, 0, 1)
                .eq(Material::getDeleted, 0)
                .orderByAsc(Material::getTotalQuantity));
    }

    @Transactional(rollbackFor = Exception.class)
    public void batchUpdateStatus(List<Long> ids, Integer status) {
        for (Long id : ids) {
            Material material = getById(id);
            if (material != null) {
                material.setStatus(status);
                updateById(material);
                clearMaterialCache(id);
            }
        }
    }

    @Transactional(rollbackFor = Exception.class)
    public void batchDelete(List<Long> ids) {
        for (Long id : ids) {
            delete(id);
        }
    }

    public long countByStatus(Integer status) {
        return count(new LambdaQueryWrapper<Material>()
                .eq(Material::getStatus, status)
                .eq(Material::getDeleted, 0));
    }
}
