package com.household.management.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.household.management.common.exception.BusinessException;
import com.household.management.entity.*;
import com.household.management.mapper.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Slf4j
@Service
public class ProductCostService {

    private final ProductCostMapper productCostMapper;
    private final ProductionWorkOrderMapper workOrderMapper;
    private final WorkOrderMaterialMapper workOrderMaterialMapper;
    private final WorkOrderProcessMapper workOrderProcessMapper;
    private final ProductMapper productMapper;

    public ProductCostService(ProductCostMapper productCostMapper,
                              ProductionWorkOrderMapper workOrderMapper,
                              WorkOrderMaterialMapper workOrderMaterialMapper,
                              WorkOrderProcessMapper workOrderProcessMapper,
                              ProductMapper productMapper) {
        this.productCostMapper = productCostMapper;
        this.workOrderMapper = workOrderMapper;
        this.workOrderMaterialMapper = workOrderMaterialMapper;
        this.workOrderProcessMapper = workOrderProcessMapper;
        this.productMapper = productMapper;
    }

    public List<ProductCost> list() {
        return productCostMapper.selectProductCostList();
    }

    public List<ProductCost> listByConditions(String statisticsMonth, Long productId) {
        return productCostMapper.selectProductCostByConditions(statisticsMonth, productId);
    }

    public ProductCost getById(Long id) {
        ProductCost cost = productCostMapper.selectProductCostDetail(id);
        if (cost == null) {
            throw new BusinessException("数据不存在");
        }
        return cost;
    }

    @Transactional(rollbackFor = Exception.class)
    public ProductCost calculateProductCost(Long workOrderId) {
        ProductionWorkOrder workOrder = workOrderMapper.selectById(workOrderId);
        if (workOrder == null) {
            throw new BusinessException("工单不存在");
        }
        if (workOrder.getStatus() != 4) {
            throw new BusinessException("工单未完成，无法核算成本");
        }

        LambdaQueryWrapper<ProductCost> existingWrapper = new LambdaQueryWrapper<>();
        existingWrapper.eq(ProductCost::getWorkOrderId, workOrderId);
        ProductCost existing = productCostMapper.selectOne(existingWrapper);
        if (existing != null) {
            return existing;
        }

        Product product = productMapper.selectById(workOrder.getProductId());
        if (product == null) {
            throw new BusinessException("产品不存在");
        }

        List<WorkOrderMaterial> materials = workOrderMaterialMapper.selectByWorkOrderId(workOrderId);
        List<WorkOrderProcess> processes = workOrderProcessMapper.selectByWorkOrderId(workOrderId);

        BigDecimal actualMaterialCost = materials.stream()
                .map(m -> m.getTotalAmount() != null ? m.getTotalAmount() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        int totalQuantity = workOrder.getPlanQuantity() != null ? workOrder.getPlanQuantity() : 0;
        int defectiveQuantity = processes.stream()
                .mapToInt(p -> p.getDefectiveQuantity() != null ? p.getDefectiveQuantity() : 0)
                .sum();
        int qualifiedQuantity = totalQuantity - defectiveQuantity;

        BigDecimal standardMaterialCost = product.getStandardMaterialCost() != null ?
                product.getStandardMaterialCost() : BigDecimal.ZERO;
        BigDecimal standardLaborCost = product.getStandardLaborCost() != null ?
                product.getStandardLaborCost() : BigDecimal.ZERO;
        BigDecimal standardOverheadCost = product.getStandardOverheadCost() != null ?
                product.getStandardOverheadCost() : BigDecimal.ZERO;
        BigDecimal standardWorkHours = product.getStandardWorkHours() != null ?
                product.getStandardWorkHours() : BigDecimal.ONE;

        BigDecimal totalStandardHours = standardWorkHours.multiply(new BigDecimal(totalQuantity));
        BigDecimal hourlyLaborRate = new BigDecimal("50");
        BigDecimal hourlyEquipmentRate = new BigDecimal("30");

        BigDecimal actualLaborCost = totalStandardHours.multiply(hourlyLaborRate);
        BigDecimal actualEquipmentCost = totalStandardHours.multiply(hourlyEquipmentRate);
        BigDecimal actualPackagingCost = new BigDecimal(totalQuantity).multiply(new BigDecimal("0.5"));

        BigDecimal defectiveUnitCost = standardMaterialCost.add(standardLaborCost).add(standardOverheadCost);
        BigDecimal defectiveScrapCost = defectiveUnitCost.multiply(new BigDecimal(defectiveQuantity));

        BigDecimal otherCost = actualMaterialCost.multiply(new BigDecimal("0.02"));

        BigDecimal totalCost = actualMaterialCost
                .add(actualLaborCost)
                .add(actualEquipmentCost)
                .add(actualPackagingCost)
                .add(defectiveScrapCost)
                .add(otherCost);

        BigDecimal unitCost = qualifiedQuantity > 0 ?
                totalCost.divide(new BigDecimal(qualifiedQuantity), 4, RoundingMode.HALF_UP) :
                BigDecimal.ZERO;

        BigDecimal standardTotalMaterialCost = standardMaterialCost.multiply(new BigDecimal(totalQuantity));
        BigDecimal materialLossRate = standardTotalMaterialCost.compareTo(BigDecimal.ZERO) > 0 ?
                actualMaterialCost.subtract(standardTotalMaterialCost)
                        .divide(standardTotalMaterialCost, 4, RoundingMode.HALF_UP)
                        .multiply(new BigDecimal("100")) :
                BigDecimal.ZERO;

        BigDecimal defectiveRate = totalQuantity > 0 ?
                new BigDecimal(defectiveQuantity)
                        .divide(new BigDecimal(totalQuantity), 4, RoundingMode.HALF_UP)
                        .multiply(new BigDecimal("100")) :
                BigDecimal.ZERO;

        ProductCost productCost = new ProductCost();
        productCost.setWorkOrderId(workOrderId);
        productCost.setProductId(workOrder.getProductId());
        productCost.setStatisticsMonth(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM")));
        productCost.setProductionQuantity(totalQuantity);
        productCost.setQualifiedQuantity(qualifiedQuantity);
        productCost.setDefectiveQuantity(defectiveQuantity);
        productCost.setActualMaterialCost(actualMaterialCost);
        productCost.setActualLaborCost(actualLaborCost);
        productCost.setActualEquipmentCost(actualEquipmentCost);
        productCost.setActualPackagingCost(actualPackagingCost);
        productCost.setDefectiveScrapCost(defectiveScrapCost);
        productCost.setOtherCost(otherCost);
        productCost.setTotalCost(totalCost);
        productCost.setUnitCost(unitCost);
        productCost.setMaterialLossRate(materialLossRate);
        productCost.setDefectiveRate(defectiveRate);

        productCostMapper.insert(productCost);

        if (product != null) {
            product.setCostPrice(unitCost);
            productMapper.updateById(product);
        }

        log.info("工单 {} 产品成本核算完成，单位成本：{}", workOrder.getWorkOrderNo(), unitCost);
        return productCost;
    }

    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        productCostMapper.deleteById(id);
        log.info("删除产品成本记录：id={}", id);
    }
}
