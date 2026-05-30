package com.radiator.management.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.radiator.management.entity.MaterialInventory;
import com.radiator.management.entity.ProductionCost;
import com.radiator.management.entity.ProductionLoss;
import com.radiator.management.exception.BusinessException;
import com.radiator.management.mapper.ProductionLossMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
public class ProductionLossService extends ServiceImpl<ProductionLossMapper, ProductionLoss> {

    @Autowired
    private MaterialInventoryService materialInventoryService;

    @Autowired
    private ProductionCostService productionCostService;

    @Transactional(rollbackFor = Exception.class)
    public void reportLoss(Long workOrderId, String workOrderNo, Long materialId,
                           BigDecimal lossQuantity, String lossType, String lossReason,
                           String responsiblePerson, Long userId, String userName) {
        MaterialInventory inventory = materialInventoryService.getById(materialId);
        if (inventory == null) {
            throw BusinessException.of("物料不存在");
        }

        if (inventory.getQuantity().compareTo(lossQuantity) < 0) {
            throw BusinessException.of("物料库存不足，无法报损");
        }

        BigDecimal totalAmount = lossQuantity.multiply(inventory.getUnitPrice());

        ProductionLoss loss = new ProductionLoss();
        loss.setWorkOrderId(workOrderId);
        loss.setWorkOrderNo(workOrderNo);
        loss.setMaterialId(materialId);
        loss.setMaterialCode(inventory.getMaterialCode());
        loss.setMaterialName(inventory.getMaterialName());
        loss.setLossType(lossType);
        loss.setLossQuantity(lossQuantity);
        loss.setUnitPrice(inventory.getUnitPrice());
        loss.setTotalAmount(totalAmount);
        loss.setLossReason(lossReason);
        loss.setResponsiblePerson(responsiblePerson);
        loss.setIsCharged(0);
        loss.setReportUserId(userId);
        loss.setReportUserName(userName);
        loss.setReportTime(LocalDateTime.now());
        this.save(loss);

        inventory.setQuantity(inventory.getQuantity().subtract(lossQuantity));
        materialInventoryService.updateById(inventory);

        log.info("生产报损成功，工单：{}，物料：{}，数量：{}，金额：{}",
                workOrderNo, inventory.getMaterialName(), lossQuantity, totalAmount);
    }

    @Transactional(rollbackFor = Exception.class)
    public Map<String, Object> collectAndChargeLoss(Long workOrderId) {
        LambdaQueryWrapper<ProductionLoss> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ProductionLoss::getWorkOrderId, workOrderId)
               .eq(ProductionLoss::getIsCharged, 0);
        List<ProductionLoss> losses = this.list(wrapper);

        if (losses.isEmpty()) {
            return Map.of("message", "无待归集损耗");
        }

        Map<String, List<ProductionLoss>> grouped = losses.stream()
                .collect(Collectors.groupingBy(ProductionLoss::getLossType));

        Map<String, BigDecimal> typeAmounts = new java.util.HashMap<>();
        BigDecimal totalLossAmount = BigDecimal.ZERO;

        for (Map.Entry<String, List<ProductionLoss>> entry : grouped.entrySet()) {
            BigDecimal typeTotal = entry.getValue().stream()
                    .map(ProductionLoss::getTotalAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            typeAmounts.put(entry.getKey(), typeTotal);
            totalLossAmount = totalLossAmount.add(typeTotal);
        }

        ProductionCost cost = productionCostService.lambdaQuery()
                .eq(ProductionCost::getWorkOrderId, workOrderId)
                .one();

        if (cost != null) {
            BigDecimal newScrapCost = cost.getScrapCost() != null ?
                    cost.getScrapCost().add(totalLossAmount) : totalLossAmount;
            cost.setScrapCost(newScrapCost);
            cost.setTotalCost(cost.getTotalCost().add(totalLossAmount));
            productionCostService.updateById(cost);
        }

        for (ProductionLoss loss : losses) {
            loss.setIsCharged(1);
            this.updateById(loss);
        }

        log.info("生产损耗归集完成，工单：{}，总损耗金额：{}", workOrderId, totalLossAmount);

        Map<String, Object> result = new java.util.HashMap<>();
        result.put("totalLossAmount", totalLossAmount);
        result.put("typeAmounts", typeAmounts);
        result.put("lossCount", losses.size());
        return result;
    }

    public List<ProductionLoss> getWorkOrderLosses(Long workOrderId) {
        LambdaQueryWrapper<ProductionLoss> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ProductionLoss::getWorkOrderId, workOrderId)
               .orderByDesc(ProductionLoss::getCreateTime);
        return this.list(wrapper);
    }

    public Map<String, BigDecimal> getLossSummaryByType(Long workOrderId) {
        List<ProductionLoss> losses = getWorkOrderLosses(workOrderId);
        return losses.stream()
                .collect(Collectors.groupingBy(
                        ProductionLoss::getLossType,
                        Collectors.reducing(
                                BigDecimal.ZERO,
                                ProductionLoss::getTotalAmount,
                                BigDecimal::add
                        )
                ));
    }
}
