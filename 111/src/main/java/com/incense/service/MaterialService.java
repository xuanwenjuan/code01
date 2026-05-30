package com.incense.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.incense.dto.MaterialDTO;
import com.incense.dto.MaterialQueryDTO;
import com.incense.dto.StockChangeDTO;
import com.incense.entity.Material;
import com.incense.exception.BusinessException;
import com.incense.mapper.MaterialMapper;
import com.incense.vo.MaterialVO;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MaterialService extends ServiceImpl<MaterialMapper, Material> {

    private static final String MATERIAL_WARNING_KEY = "incense:material:warning";
    private static final String MATERIAL_STATS_KEY = "incense:material:stats";

    private final RedisTemplate<String, Object> redisTemplate;
    private final MaterialStockLockService stockLockService;

    @Transactional(rollbackFor = Exception.class)
    public void addMaterial(MaterialDTO dto) {
        LambdaQueryWrapper<Material> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Material::getBatchCode, dto.getBatchCode());
        if (count(wrapper) > 0) {
            throw new BusinessException("批次编码已存在");
        }

        Material material = new Material();
        BeanUtils.copyProperties(dto, material);
        material.setCreateTime(LocalDateTime.now());
        updateMaterialStatus(material);
        save(material);
        clearMaterialCache();
    }

    @Transactional(rollbackFor = Exception.class)
    public void updateMaterial(MaterialDTO dto) {
        Material material = getById(dto.getId());
        if (material == null) {
            throw new BusinessException("原料不存在");
        }

        LambdaQueryWrapper<Material> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Material::getBatchCode, dto.getBatchCode())
                .ne(Material::getId, dto.getId());
        if (count(wrapper) > 0) {
            throw new BusinessException("批次编码已存在");
        }

        BeanUtils.copyProperties(dto, material);
        material.setUpdateTime(LocalDateTime.now());
        updateMaterialStatus(material);
        updateById(material);
        clearMaterialCache();
    }

    @Transactional(rollbackFor = Exception.class)
    public void deleteMaterial(Long id) {
        removeById(id);
        clearMaterialCache();
    }

    public Page<Material> getPage(int pageNum, int pageSize, String materialType, String status, String keyword) {
        LambdaQueryWrapper<Material> wrapper = new LambdaQueryWrapper<>();
        if (materialType != null && !materialType.isEmpty()) {
            wrapper.eq(Material::getMaterialType, materialType);
        }
        if (status != null && !status.isEmpty()) {
            wrapper.eq(Material::getStatus, status);
        }
        if (keyword != null && !keyword.isEmpty()) {
            wrapper.and(w -> w.like(Material::getMaterialName, keyword)
                    .or().like(Material::getBatchCode, keyword));
        }
        wrapper.orderByDesc(Material::getCreateTime);
        return page(new Page<>(pageNum, pageSize), wrapper);
    }

    public Page<MaterialVO> queryMaterialPage(MaterialQueryDTO queryDTO) {
        LambdaQueryWrapper<Material> wrapper = new LambdaQueryWrapper<>();

        if (queryDTO.getMaterialType() != null && !queryDTO.getMaterialType().isEmpty()) {
            wrapper.eq(Material::getMaterialType, queryDTO.getMaterialType());
        }

        if (queryDTO.getStatus() != null && !queryDTO.getStatus().isEmpty()) {
            wrapper.eq(Material::getStatus, queryDTO.getStatus());
        }

        if (queryDTO.getKeyword() != null && !queryDTO.getKeyword().isEmpty()) {
            wrapper.and(w -> w.like(Material::getMaterialName, queryDTO.getKeyword())
                    .or().like(Material::getBatchCode, queryDTO.getKeyword()));
        }

        if (queryDTO.getFineness() != null && !queryDTO.getFineness().isEmpty()) {
            wrapper.like(Material::getFineness, queryDTO.getFineness());
        }

        if (queryDTO.getOrigin() != null && !queryDTO.getOrigin().isEmpty()) {
            wrapper.like(Material::getOrigin, queryDTO.getOrigin());
        }

        wrapper.orderByDesc(Material::getCreateTime);
        Page<Material> page = page(new Page<>(queryDTO.getPageNum(), queryDTO.getPageSize()), wrapper);

        Page<MaterialVO> voPage = new Page<>(page.getCurrent(), page.getSize(), page.getTotal());
        voPage.setRecords(page.getRecords().stream()
                .map(this::convertToVO)
                .collect(Collectors.toList()));

        return voPage;
    }

    public MaterialVO getMaterialVOById(Long id) {
        Material material = getById(id);
        if (material == null) {
            return null;
        }
        return convertToVO(material);
    }

    private MaterialVO convertToVO(Material material) {
        MaterialVO vo = new MaterialVO();
        BeanUtils.copyProperties(material, vo);

        BigDecimal lockedQuantity = stockLockService.getLockedQuantityByMaterialId(material.getId());
        vo.setLockedQuantity(lockedQuantity);
        vo.setAvailableQuantity(material.getStockQuantity().subtract(lockedQuantity));

        return vo;
    }

    @SuppressWarnings("unchecked")
    public List<Material> getWarningList() {
        Object cached = redisTemplate.opsForValue().get(MATERIAL_WARNING_KEY);
        if (cached != null) {
            return (List<Material>) cached;
        }

        LambdaQueryWrapper<Material> wrapper = new LambdaQueryWrapper<>();
        wrapper.and(w -> w.eq(Material::getStatus, "WARNING")
                        .or()
                        .lt(Material::getStockQuantity, Material::getWarningQuantity))
                .or(w -> w.isNotNull(Material::getExpireDate)
                        .le(Material::getExpireDate, LocalDate.now().plusDays(7)));
        List<Material> list = list(wrapper);
        redisTemplate.opsForValue().set(MATERIAL_WARNING_KEY, list);
        return list;
    }

    @SuppressWarnings("unchecked")
    public Map<String, Long> getMaterialStats() {
        Object cached = redisTemplate.opsForValue().get(MATERIAL_STATS_KEY);
        if (cached != null) {
            return (Map<String, Long>) cached;
        }

        List<Material> materials = list();
        Map<String, Long> stats = materials.stream()
                .collect(Collectors.groupingBy(
                        Material::getStatus,
                        Collectors.counting()
                ));
        redisTemplate.opsForValue().set(MATERIAL_STATS_KEY, stats);
        return stats;
    }

    private void updateMaterialStatus(Material material) {
        if (material.getStockQuantity().compareTo(BigDecimal.ZERO) <= 0) {
            material.setStatus("DISABLED");
        } else if (material.getStockQuantity().compareTo(material.getWarningQuantity()) <= 0) {
            material.setStatus("WARNING");
        } else {
            material.setStatus("SUFFICIENT");
        }
    }

    @Transactional(rollbackFor = Exception.class)
    public void updateStock(Long id, BigDecimal quantity) {
        Material material = getById(id);
        if (material == null) {
            throw new BusinessException("原料不存在");
        }
        material.setStockQuantity(material.getStockQuantity().add(quantity));
        updateMaterialStatus(material);
        updateById(material);
        clearMaterialCache();
    }

    @Transactional(rollbackFor = Exception.class)
    public void batchStockChange(List<StockChangeDTO> changes) {
        for (StockChangeDTO change : changes) {
            updateStock(change.getMaterialId(), change.getQuantity());
        }
    }

    public List<Material> getByType(String materialType) {
        LambdaQueryWrapper<Material> wrapper = new LambdaQueryWrapper<>();
        if (materialType != null && !materialType.isEmpty()) {
            wrapper.eq(Material::getMaterialType, materialType);
        }
        wrapper.eq(Material::getStatus, "SUFFICIENT")
                .orderByAsc(Material::getMaterialName);
        return list(wrapper);
    }

    private void clearMaterialCache() {
        redisTemplate.delete(MATERIAL_WARNING_KEY);
        redisTemplate.delete(MATERIAL_STATS_KEY);
    }
}
