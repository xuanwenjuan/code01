package com.valve.manufacture.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.valve.manufacture.entity.ProductionLoss;
import com.valve.manufacture.mapper.ProductionLossMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductionLossService extends ServiceImpl<ProductionLossMapper, ProductionLoss> {

    @Transactional(rollbackFor = Exception.class)
    public ProductionLoss recordLoss(ProductionLoss loss) {
        loss.setLossTime(LocalDateTime.now());
        if (loss.getLossQuantity() != null && loss.getUnitPrice() != null) {
            loss.setLossAmount(loss.getLossQuantity().multiply(loss.getUnitPrice()));
        }
        save(loss);
        return loss;
    }

    public List<ProductionLoss> getByWorkOrderId(Long workOrderId) {
        return list(new LambdaQueryWrapper<ProductionLoss>()
                .eq(ProductionLoss::getWorkOrderId, workOrderId)
                .orderByDesc(ProductionLoss::getLossTime));
    }

    public BigDecimal calculateTotalLossAmount(Long workOrderId) {
        List<ProductionLoss> losses = getByWorkOrderId(workOrderId);
        BigDecimal materialLoss = losses.stream()
                .map(l -> l.getLossAmount() != null ? l.getLossAmount() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal toolWear = losses.stream()
                .map(l -> l.getToolWearCost() != null ? l.getToolWearCost() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal energy = losses.stream()
                .map(l -> l.getEnergyCost() != null ? l.getEnergyCost() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal scrap = losses.stream()
                .map(l -> l.getScrapCost() != null ? l.getScrapCost() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return materialLoss.add(toolWear).add(energy).add(scrap);
    }

    public int getTotalScrapCount(Long workOrderId) {
        List<ProductionLoss> losses = getByWorkOrderId(workOrderId);
        return losses.stream()
                .mapToInt(l -> l.getScrapCount() != null ? l.getScrapCount() : 0)
                .sum();
    }
}
