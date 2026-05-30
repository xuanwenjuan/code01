package com.bearing.production.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.bearing.production.dto.CostCalculationDTO;
import com.bearing.production.entity.ProductionWaste;
import com.bearing.production.exception.BusinessException;
import com.bearing.production.mapper.ProductionWasteMapper;
import com.bearing.production.util.RedisUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProductionWasteService {

    private final ProductionWasteMapper productionWasteMapper;
    private final RedisUtil redisUtil;

    private static final String WASTE_KEY = "bearing:waste:";

    @Transactional(rollbackFor = Exception.class)
    @CacheEvict(value = "wasteCache", allEntries = true)
    public ProductionWaste createProductionWaste(CostCalculationDTO dto, String orderNo, Long categoryId, String categoryName, Long materialId, String materialName, BigDecimal productionQuantity) {
        ProductionWaste waste = new ProductionWaste();
        waste.setWorkOrderId(dto.getWorkOrderId());
        waste.setOrderNo(orderNo);
        waste.setCategoryId(categoryId);
        waste.setCategoryName(categoryName);
        waste.setMaterialId(materialId);
        waste.setMaterialName(materialName);
        waste.setMaterialWaste(dto.getMaterialWaste() != null ? dto.getMaterialWaste() : BigDecimal.ZERO);
        waste.setEquipmentWear(dto.getEquipmentWear() != null ? dto.getEquipmentWear() : BigDecimal.ZERO);
        waste.setEnergyCost(dto.getEnergyCost() != null ? dto.getEnergyCost() : BigDecimal.ZERO);
        waste.setLaborCost(dto.getLaborCost() != null ? dto.getLaborCost() : BigDecimal.ZERO);
        waste.setDefectiveQuantity(dto.getDefectiveQuantity() != null ? dto.getDefectiveQuantity() : BigDecimal.ZERO);
        waste.setDefectiveLoss(dto.getDefectiveLoss() != null ? dto.getDefectiveLoss() : BigDecimal.ZERO);
        waste.setProductionQuantity(productionQuantity);
        
        BigDecimal qualifiedQuantity = productionQuantity.subtract(waste.getDefectiveQuantity());
        if (qualifiedQuantity.compareTo(BigDecimal.ZERO) < 0) {
            qualifiedQuantity = BigDecimal.ZERO;
        }
        waste.setQualifiedQuantity(qualifiedQuantity);
        
        BigDecimal totalCost = waste.getMaterialWaste()
                .add(waste.getEquipmentWear())
                .add(waste.getEnergyCost())
                .add(waste.getLaborCost())
                .add(waste.getDefectiveLoss());
        waste.setTotalCost(totalCost);
        
        if (qualifiedQuantity.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal unitCost = totalCost.divide(qualifiedQuantity, 4, RoundingMode.HALF_UP);
            waste.setUnitCost(unitCost);
        } else {
            waste.setUnitCost(BigDecimal.ZERO);
        }
        
        if (productionQuantity.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal yieldRate = qualifiedQuantity
                    .divide(productionQuantity, 4, RoundingMode.HALF_UP)
                    .multiply(new BigDecimal("100"));
            waste.setYieldRate(yieldRate);
        } else {
            waste.setYieldRate(BigDecimal.ZERO);
        }
        
        waste.setQualityInspector(dto.getQualityInspector());
        waste.setCalculationTime(LocalDateTime.now());
        waste.setRemark(dto.getRemark());
        
        productionWasteMapper.insert(waste);
        
        log.info("【生产成本统计】工单ID: {}, 总成本: {}, 良品率: {}%", dto.getWorkOrderId(), totalCost, waste.getYieldRate());
        return waste;
    }

    @Cacheable(value = "wasteCache", key = "'id:' + #id")
    public ProductionWaste getById(Long id) {
        ProductionWaste waste = productionWasteMapper.selectById(id);
        if (waste == null) {
            throw new BusinessException("生产损耗记录不存在");
        }
        return waste;
    }

    public List<ProductionWaste> getByWorkOrderId(Long workOrderId) {
        LambdaQueryWrapper<ProductionWaste> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ProductionWaste::getWorkOrderId, workOrderId);
        wrapper.orderByDesc(ProductionWaste::getCreateTime);
        return productionWasteMapper.selectList(wrapper);
    }

    @Cacheable(value = "wasteCache", key = "'category:' + #categoryId + ':' + #startDate + ':' + #endDate")
    public List<ProductionWaste> getByCategoryId(Long categoryId, LocalDateTime startDate, LocalDateTime endDate) {
        LambdaQueryWrapper<ProductionWaste> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(categoryId != null, ProductionWaste::getCategoryId, categoryId);
        if (startDate != null) {
            wrapper.ge(ProductionWaste::getCalculationTime, startDate);
        }
        if (endDate != null) {
            wrapper.le(ProductionWaste::getCalculationTime, endDate);
        }
        wrapper.orderByDesc(ProductionWaste::getCalculationTime);
        return productionWasteMapper.selectList(wrapper);
    }

    @Cacheable(value = "wasteCache", key = "'page:' + #page + ':' + #size + ':' + #categoryId")
    public IPage<ProductionWaste> getByPage(int page, int size, Long categoryId) {
        LambdaQueryWrapper<ProductionWaste> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(categoryId != null, ProductionWaste::getCategoryId, categoryId);
        wrapper.orderByDesc(ProductionWaste::getCalculationTime);
        return productionWasteMapper.selectPage(new Page<>(page, size), wrapper);
    }

    public BigDecimal calculateTotalCostByCategory(Long categoryId, LocalDateTime startDate, LocalDateTime endDate) {
        List<ProductionWaste> wasteList = getByCategoryId(categoryId, startDate, endDate);
        return wasteList.stream()
                .map(ProductionWaste::getTotalCost)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
