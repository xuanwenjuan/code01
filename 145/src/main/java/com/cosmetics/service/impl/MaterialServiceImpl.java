package com.cosmetics.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.cosmetics.common.PageQuery;
import com.cosmetics.common.ResultCode;
import com.cosmetics.dto.MaterialQueryDTO;
import com.cosmetics.entity.Material;
import com.cosmetics.entity.MaterialBatch;
import com.cosmetics.exception.BusinessException;
import com.cosmetics.mapper.MaterialBatchMapper;
import com.cosmetics.mapper.MaterialMapper;
import com.cosmetics.service.MaterialService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MaterialServiceImpl implements MaterialService {

    private final MaterialMapper materialMapper;
    private final MaterialBatchMapper materialBatchMapper;

    @Override
    public Page<Material> getPage(PageQuery pageQuery, Integer type, String keyword, Integer status) {
        LambdaQueryWrapper<Material> wrapper = new LambdaQueryWrapper<>();
        if (type != null) {
            wrapper.eq(Material::getType, type);
        }
        if (keyword != null && !keyword.isEmpty()) {
            wrapper.and(w -> w.like(Material::getName, keyword)
                    .or().like(Material::getMaterialCode, keyword));
        }
        if (status != null) {
            wrapper.eq(Material::getStatus, status);
        }
        wrapper.orderByDesc(Material::getCreateTime);

        return materialMapper.selectPage(
                new Page<>(pageQuery.getPageNum(), pageQuery.getPageSize()),
                wrapper
        );
    }

    @Override
    public Material getById(Long id) {
        return materialMapper.selectById(id);
    }

    @Override
    public void add(Material material) {
        Long count = materialMapper.selectCount(
                new LambdaQueryWrapper<Material>()
                        .eq(Material::getMaterialCode, material.getMaterialCode())
        );
        if (count > 0) {
            throw new BusinessException(ResultCode.DATA_ALREADY_EXISTS.getCode(), "原料编码已存在");
        }
        if (material.getStatus() == null) {
            material.setStatus(1);
        }
        if (material.getIsLiquid() == null) {
            material.setIsLiquid(0);
        }
        materialMapper.insert(material);
    }

    @Override
    public void update(Material material) {
        Material exist = materialMapper.selectById(material.getId());
        if (exist == null) {
            throw new BusinessException(ResultCode.DATA_NOT_FOUND);
        }
        if (!exist.getMaterialCode().equals(material.getMaterialCode())) {
            Long count = materialMapper.selectCount(
                    new LambdaQueryWrapper<Material>()
                            .eq(Material::getMaterialCode, material.getMaterialCode())
                            .ne(Material::getId, material.getId())
            );
            if (count > 0) {
                throw new BusinessException(ResultCode.DATA_ALREADY_EXISTS.getCode(), "原料编码已存在");
            }
        }
        materialMapper.updateById(material);
    }

    @Override
    public void delete(Long id) {
        materialMapper.deleteById(id);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateStatus(Long id, Integer status) {
        Material material = new Material();
        material.setId(id);
        material.setStatus(status);
        materialMapper.updateById(material);
    }

    @Override
    public Page<Material> getPageByConditions(PageQuery pageQuery, MaterialQueryDTO queryDTO) {
        LambdaQueryWrapper<Material> wrapper = new LambdaQueryWrapper<>();

        if (queryDTO.getKeyword() != null && !queryDTO.getKeyword().isEmpty()) {
            wrapper.and(w -> w.like(Material::getName, queryDTO.getKeyword())
                    .or().like(Material::getMaterialCode, queryDTO.getKeyword()));
        }
        if (queryDTO.getType() != null) {
            wrapper.eq(Material::getType, queryDTO.getType());
        }
        if (queryDTO.getStatus() != null) {
            wrapper.eq(Material::getStatus, queryDTO.getStatus());
        }
        if (queryDTO.getIsLiquid() != null) {
            wrapper.eq(Material::getIsLiquid, queryDTO.getIsLiquid());
        }

        wrapper.orderByDesc(Material::getCreateTime);

        Page<Material> page = materialMapper.selectPage(
                new Page<>(pageQuery.getPageNum(), pageQuery.getPageSize()),
                wrapper
        );

        if (queryDTO.getMinStock() != null || queryDTO.getMaxStock() != null
                || Boolean.TRUE.equals(queryDTO.getExpiringWarning())) {
            List<Material> filteredRecords = new ArrayList<>();
            for (Material material : page.getRecords()) {
                BigDecimal totalStock = calculateTotalStock(material.getId());
                material.setCurrentStock(totalStock);

                boolean include = true;
                if (queryDTO.getMinStock() != null && totalStock.compareTo(queryDTO.getMinStock()) < 0) {
                    include = false;
                }
                if (queryDTO.getMaxStock() != null && totalStock.compareTo(queryDTO.getMaxStock()) > 0) {
                    include = false;
                }
                if (Boolean.TRUE.equals(queryDTO.getExpiringWarning())) {
                    int days = queryDTO.getExpiringDays() != null ? queryDTO.getExpiringDays() : 30;
                    include = hasExpiringBatch(material.getId(), days);
                }

                if (include) {
                    filteredRecords.add(material);
                }
            }
            page.setRecords(filteredRecords);
            page.setTotal(filteredRecords.size());
        } else {
            for (Material material : page.getRecords()) {
                material.setCurrentStock(calculateTotalStock(material.getId()));
            }
        }

        return page;
    }

    @Override
    public List<Map<String, Object>> getMaterialStatistics() {
        List<Material> materials = materialMapper.selectList(new LambdaQueryWrapper<>());
        List<Map<String, Object>> stats = new ArrayList<>();

        Map<Integer, Long> typeCount = materials.stream()
                .collect(Collectors.groupingBy(Material::getType, Collectors.counting()));

        Map<Integer, Long> statusCount = materials.stream()
                .collect(Collectors.groupingBy(Material::getStatus, Collectors.counting()));

        String[] typeNames = {"", "植物萃取", "表面活性剂", "香精色素", "包装瓶盒耗材"};
        String[] statusNames = {"", "正常库存", "库存预警", "暂停采购"};

        for (int i = 1; i <= 4; i++) {
            Map<String, Object> typeStat = new HashMap<>();
            typeStat.put("type", i);
            typeStat.put("typeName", typeNames[i]);
            typeStat.put("count", typeCount.getOrDefault(i, 0L));
            stats.add(typeStat);
        }

        long totalValue = materials.size();
        long warningValue = statusCount.getOrDefault(2, 0L);
        long suspendValue = statusCount.getOrDefault(3, 0L);

        Map<String, Object> summary = new HashMap<>();
        summary.put("total", totalValue);
        summary.put("normal", statusCount.getOrDefault(1, 0L));
        summary.put("warning", warningValue);
        summary.put("suspend", suspendValue);

        return stats;
    }

    private BigDecimal calculateTotalStock(Long materialId) {
        return materialBatchMapper.selectList(
                        new LambdaQueryWrapper<MaterialBatch>()
                                .eq(MaterialBatch::getMaterialId, materialId)
                                .eq(MaterialBatch::getIsExpired, 0)
                ).stream()
                .map(MaterialBatch::getRemainingQuantity)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private boolean hasExpiringBatch(Long materialId, int days) {
        LocalDate warningDate = LocalDate.now().plusDays(days);
        Long count = materialBatchMapper.selectCount(
                new LambdaQueryWrapper<MaterialBatch>()
                        .eq(MaterialBatch::getMaterialId, materialId)
                        .eq(MaterialBatch::getIsExpired, 0)
                        .le(MaterialBatch::getExpiryDate, warningDate)
                        .gt(MaterialBatch::getRemainingQuantity, BigDecimal.ZERO)
        );
        return count != null && count > 0;
    }
}
