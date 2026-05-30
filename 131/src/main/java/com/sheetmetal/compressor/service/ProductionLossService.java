package com.sheetmetal.compressor.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.sheetmetal.compressor.common.PageResult;
import com.sheetmetal.compressor.context.UserContext;
import com.sheetmetal.compressor.dto.ProductionLossDTO;
import com.sheetmetal.compressor.entity.ProductionCost;
import com.sheetmetal.compressor.entity.ProductionLoss;
import com.sheetmetal.compressor.entity.ProductionOrder;
import com.sheetmetal.compressor.exception.BusinessException;
import com.sheetmetal.compressor.mapper.ProductionCostMapper;
import com.sheetmetal.compressor.mapper.ProductionLossMapper;
import com.sheetmetal.compressor.mapper.ProductionOrderMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class ProductionLossService {

    @Autowired
    private ProductionLossMapper productionLossMapper;

    @Autowired
    private ProductionOrderMapper orderMapper;

    @Autowired
    private ProductionCostMapper productionCostMapper;

    public PageResult<ProductionLoss> queryPage(ProductionLossDTO dto, Long orderId, Integer lossType) {
        LambdaQueryWrapper<ProductionLoss> wrapper = new LambdaQueryWrapper<>();
        if (orderId != null) {
            wrapper.eq(ProductionLoss::getOrderId, orderId);
        }
        if (lossType != null) {
            wrapper.eq(ProductionLoss::getLossType, lossType);
        }
        wrapper.orderByDesc(ProductionLoss::getCreatedTime);

        IPage<ProductionLoss> page = new Page<>(dto.getCurrent(), dto.getSize());
        IPage<ProductionLoss> result = productionLossMapper.selectPage(page, wrapper);

        return PageResult.of(result.getRecords(), result.getTotal(), result.getSize(), result.getCurrent());
    }

    public List<ProductionLoss> getByOrderId(Long orderId) {
        return productionLossMapper.selectList(
                new LambdaQueryWrapper<ProductionLoss>()
                        .eq(ProductionLoss::getOrderId, orderId)
                        .orderByDesc(ProductionLoss::getCreatedTime)
        );
    }

    @Transactional(rollbackFor = Exception.class)
    public void add(ProductionLossDTO dto) {
        ProductionOrder order = orderMapper.selectById(dto.getOrderId());
        if (order == null) {
            throw new BusinessException("工单不存在");
        }

        ProductionLoss loss = new ProductionLoss();
        loss.setLossNo("LOSS" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmssSSS")));
        loss.setOrderId(dto.getOrderId());
        loss.setOrderNo(order.getOrderNo());
        loss.setCategoryId(order.getCategoryId());
        loss.setCategoryName(order.getCategoryName());
        loss.setLossType(dto.getLossType());
        loss.setLossName(dto.getLossName());
        loss.setLossQuantity(dto.getLossQuantity());
        loss.setLossAmount(dto.getLossAmount());
        loss.setLossRate(dto.getLossRate());
        loss.setUnitPrice(dto.getUnitPrice());
        loss.setHandlerId(UserContext.getUserId());
        loss.setHandlerName(UserContext.getUsername());
        loss.setRemark(dto.getRemark());
        loss.setCreatedTime(LocalDateTime.now());
        loss.setUpdatedTime(LocalDateTime.now());

        productionLossMapper.insert(loss);
    }

    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        productionLossMapper.deleteById(id);
    }

    @Transactional(rollbackFor = Exception.class)
    public void aggregateLossOnComplete(Long orderId) {
        ProductionOrder order = orderMapper.selectById(orderId);
        if (order == null) {
            throw new BusinessException("工单不存在");
        }

        List<ProductionLoss> losses = getByOrderId(orderId);

        BigDecimal materialLossTotal = BigDecimal.ZERO;
        BigDecimal equipmentLossTotal = BigDecimal.ZERO;
        BigDecimal laborLossTotal = BigDecimal.ZERO;
        BigDecimal defectiveLossTotal = BigDecimal.ZERO;
        BigDecimal otherLossTotal = BigDecimal.ZERO;

        for (ProductionLoss loss : losses) {
            switch (loss.getLossType()) {
                case 1:
                    materialLossTotal = materialLossTotal.add(loss.getLossAmount());
                    break;
                case 2:
                    equipmentLossTotal = equipmentLossTotal.add(loss.getLossAmount());
                    break;
                case 3:
                    laborLossTotal = laborLossTotal.add(loss.getLossAmount());
                    break;
                case 4:
                    defectiveLossTotal = defectiveLossTotal.add(loss.getLossAmount());
                    break;
                case 5:
                    otherLossTotal = otherLossTotal.add(loss.getLossAmount());
                    break;
            }
        }

        BigDecimal totalLoss = materialLossTotal.add(equipmentLossTotal)
                .add(laborLossTotal).add(defectiveLossTotal).add(otherLossTotal);

        ProductionCost cost = productionCostMapper.selectOne(
                new LambdaQueryWrapper<ProductionCost>()
                        .eq(ProductionCost::getOrderId, orderId)
                        .last("LIMIT 1")
        );

        if (cost == null) {
            cost = new ProductionCost();
            cost.setCostNo("COST" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmssSSS")));
            cost.setCategoryId(order.getCategoryId());
            cost.setCategoryName(order.getCategoryName());
            cost.setOrderId(orderId);
            cost.setOrderNo(order.getOrderNo());
            cost.setProductionQuantity(order.getActualQuantity());
            cost.setMaterialCost(materialLossTotal);
            cost.setEquipmentCost(equipmentLossTotal);
            cost.setLaborCost(laborLossTotal);
            cost.setDefectiveCost(defectiveLossTotal);
            cost.setOtherCost(otherLossTotal);
            cost.setTotalCost(totalLoss);

            if (order.getActualQuantity() != null && order.getActualQuantity() > 0) {
                cost.setUnitCost(totalLoss.divide(BigDecimal.valueOf(order.getActualQuantity()), 2, BigDecimal.ROUND_HALF_UP));
            } else {
                cost.setUnitCost(BigDecimal.ZERO);
            }

            cost.setCostDate(LocalDate.now());
            cost.setQuarter(getQuarter(LocalDate.now()));
            cost.setCreatedTime(LocalDateTime.now());
            cost.setUpdatedTime(LocalDateTime.now());
            productionCostMapper.insert(cost);
        } else {
            cost.setMaterialCost(cost.getMaterialCost() != null ? cost.getMaterialCost().add(materialLossTotal) : materialLossTotal);
            cost.setEquipmentCost(cost.getEquipmentCost() != null ? cost.getEquipmentCost().add(equipmentLossTotal) : equipmentLossTotal);
            cost.setLaborCost(cost.getLaborCost() != null ? cost.getLaborCost().add(laborLossTotal) : laborLossTotal);
            cost.setDefectiveCost(cost.getDefectiveCost() != null ? cost.getDefectiveCost().add(defectiveLossTotal) : defectiveLossTotal);
            cost.setOtherCost(cost.getOtherCost() != null ? cost.getOtherCost().add(otherLossTotal) : otherLossTotal);

            BigDecimal newTotal = (cost.getMaterialCost() != null ? cost.getMaterialCost() : BigDecimal.ZERO)
                    .add(cost.getEquipmentCost() != null ? cost.getEquipmentCost() : BigDecimal.ZERO)
                    .add(cost.getLaborCost() != null ? cost.getLaborCost() : BigDecimal.ZERO)
                    .add(cost.getDefectiveCost() != null ? cost.getDefectiveCost() : BigDecimal.ZERO)
                    .add(cost.getOtherCost() != null ? cost.getOtherCost() : BigDecimal.ZERO);
            cost.setTotalCost(newTotal);

            if (cost.getProductionQuantity() != null && cost.getProductionQuantity() > 0) {
                cost.setUnitCost(newTotal.divide(BigDecimal.valueOf(cost.getProductionQuantity()), 2, BigDecimal.ROUND_HALF_UP));
            }

            cost.setUpdatedTime(LocalDateTime.now());
            productionCostMapper.updateById(cost);
        }
    }

    private String getQuarter(LocalDate date) {
        int year = date.getYear();
        int month = date.getMonthValue();
        int quarter = (month - 1) / 3 + 1;
        return year + "Q" + quarter;
    }
}
