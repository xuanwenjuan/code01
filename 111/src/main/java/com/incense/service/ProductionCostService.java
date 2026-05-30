package com.incense.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.incense.context.UserContext;
import com.incense.entity.*;
import com.incense.mapper.ProductionCostMapper;
import com.incense.vo.ProductionCostVO;
import com.incense.vo.ProductionLossVO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProductionCostService extends ServiceImpl<ProductionCostMapper, ProductionCost> {

    private final ProductionOrderService orderService;
    private final OrderMaterialUsageService materialUsageService;
    private final ProductionLossService lossService;
    private final MaterialStockLockService stockLockService;

    @Transactional(rollbackFor = Exception.class)
    public ProductionCostVO calculateAndSaveCost(Long orderId) {
        ProductionOrder order = orderService.getById(orderId);
        if (order == null) {
            throw new RuntimeException("工单不存在");
        }

        if (!"PACKAGED".equals(order.getStatus())) {
            throw new RuntimeException("工单未完成，无法核算成本");
        }

        stockLockService.confirmStockUsage(orderId);

        List<OrderMaterialUsage> materialUsages = materialUsageService.getByOrderId(orderId);
        BigDecimal materialCost = materialUsages.stream()
                .map(usage -> usage.getTotalPrice() != null ? usage.getTotalPrice() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<ProductionLoss> losses = lossService.getLossByOrderId(orderId);
        BigDecimal lossCost = losses.stream()
                .map(loss -> loss.getLossAmount() != null ? loss.getLossAmount() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal processCost = BigDecimal.ZERO;

        BigDecimal totalCost = materialCost.add(processCost).add(lossCost);
        BigDecimal unitCost = order.getActualQuantity() != null && order.getActualQuantity().compareTo(BigDecimal.ZERO) > 0
                ? totalCost.divide(order.getActualQuantity(), 4, BigDecimal.ROUND_HALF_UP)
                : BigDecimal.ZERO;

        LambdaQueryWrapper<ProductionCost> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ProductionCost::getOrderId, orderId);
        ProductionCost existingCost = getOne(wrapper);

        ProductionCost cost;
        if (existingCost != null) {
            cost = existingCost;
        } else {
            cost = new ProductionCost();
            cost.setCreateTime(LocalDateTime.now());
        }

        cost.setOrderId(orderId);
        cost.setOrderNo(order.getOrderNo());
        cost.setCategoryId(order.getCategoryId());
        cost.setCategoryName(order.getCategoryName());
        cost.setTargetQuantity(order.getTargetQuantity());
        cost.setActualQuantity(order.getActualQuantity());
        cost.setMaterialCost(materialCost);
        cost.setProcessCost(processCost);
        cost.setLossCost(lossCost);
        cost.setTotalCost(totalCost);
        cost.setUnitCost(unitCost);
        cost.setOperatorId(UserContext.getUserId());
        cost.setOperatorName(UserContext.getUsername());
        cost.setUpdateTime(LocalDateTime.now());

        saveOrUpdate(cost);

        log.info("工单{}成本核算完成，总成本：{}，单位成本：{}", order.getOrderNo(), totalCost, unitCost);

        return convertToVO(cost, losses);
    }

    public ProductionCostVO getCostByOrderId(Long orderId) {
        LambdaQueryWrapper<ProductionCost> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ProductionCost::getOrderId, orderId);
        ProductionCost cost = getOne(wrapper);
        if (cost == null) {
            return null;
        }
        List<ProductionLoss> losses = lossService.getLossByOrderId(orderId);
        return convertToVO(cost, losses);
    }

    private ProductionCostVO convertToVO(ProductionCost cost, List<ProductionLoss> losses) {
        ProductionCostVO vo = new ProductionCostVO();
        BeanUtils.copyProperties(cost, vo);

        if (losses != null) {
            List<ProductionLossVO> lossVOList = losses.stream()
                    .map(this::convertLossToVO)
                    .collect(Collectors.toList());
            vo.setLossDetails(lossVOList);
        }

        return vo;
    }

    private ProductionLossVO convertLossToVO(ProductionLoss loss) {
        ProductionLossVO vo = new ProductionLossVO();
        BeanUtils.copyProperties(loss, vo);
        return vo;
    }
}
