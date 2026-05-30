package com.incense.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.incense.context.UserContext;
import com.incense.dto.ProductionLossDTO;
import com.incense.entity.Material;
import com.incense.entity.ProductionLoss;
import com.incense.exception.BusinessException;
import com.incense.mapper.ProductionLossMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProductionLossService extends ServiceImpl<ProductionLossMapper, ProductionLoss> {

    private final MaterialService materialService;
    private final MaterialStockLockService stockLockService;

    @Transactional(rollbackFor = Exception.class)
    public void recordLoss(ProductionLossDTO dto) {
        Material material = materialService.getById(dto.getMaterialId());
        if (material == null) {
            throw new BusinessException("原料不存在");
        }

        BigDecimal lockedQuantity = stockLockService.getLockedQuantityByMaterialId(dto.getMaterialId());
        BigDecimal availableQuantity = material.getStockQuantity().subtract(lockedQuantity);

        if (availableQuantity.compareTo(dto.getLossQuantity()) < 0) {
            throw new BusinessException("可用库存不足，无法报损");
        }

        ProductionLoss loss = new ProductionLoss();
        loss.setOrderId(dto.getOrderId());
        loss.setMaterialId(dto.getMaterialId());
        loss.setMaterialName(material.getMaterialName());
        loss.setBatchCode(dto.getBatchCode());
        loss.setLossType(dto.getLossType());
        loss.setLossQuantity(dto.getLossQuantity());
        loss.setUnitPrice(material.getUnitPrice());
        loss.setLossAmount(material.getUnitPrice() != null ?
                material.getUnitPrice().multiply(dto.getLossQuantity()) : null);
        loss.setLossReason(dto.getLossReason());
        loss.setOperatorId(UserContext.getUserId());
        loss.setOperatorName(UserContext.getUsername());
        loss.setCreateTime(LocalDateTime.now());
        save(loss);

        materialService.updateStock(dto.getMaterialId(), dto.getLossQuantity().negate());

        log.info("记录生产损耗，工单：{}，原料：{}，数量：{}", dto.getOrderId(), material.getMaterialName(), dto.getLossQuantity());
    }

    public List<ProductionLoss> getLossByOrderId(Long orderId) {
        LambdaQueryWrapper<ProductionLoss> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ProductionLoss::getOrderId, orderId)
                .orderByDesc(ProductionLoss::getCreateTime);
        return list(wrapper);
    }

    public BigDecimal getTotalLossAmountByOrderId(Long orderId) {
        List<ProductionLoss> losses = getLossByOrderId(orderId);
        return losses.stream()
                .map(loss -> loss.getLossAmount() != null ? loss.getLossAmount() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
