package com.incense.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.incense.dto.MaterialUsageDTO;
import com.incense.entity.Material;
import com.incense.entity.OrderMaterialUsage;
import com.incense.mapper.OrderMaterialUsageMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderMaterialUsageService extends ServiceImpl<OrderMaterialUsageMapper, OrderMaterialUsage> {

    private final MaterialService materialService;

    public void recordUsage(Long orderId, String orderNo, MaterialUsageDTO dto) {
        Material material = materialService.getById(dto.getMaterialId());
        if (material == null) {
            return;
        }

        OrderMaterialUsage usage = new OrderMaterialUsage();
        usage.setOrderId(orderId);
        usage.setOrderNo(orderNo);
        usage.setMaterialId(dto.getMaterialId());
        usage.setMaterialName(material.getMaterialName());
        usage.setBatchCode(dto.getBatchCode() != null ? dto.getBatchCode() : material.getBatchCode());
        usage.setUsageQuantity(dto.getUsageQuantity());
        usage.setUnit(dto.getUnit() != null ? dto.getUnit() : material.getUnit());
        usage.setUnitPrice(dto.getUnitPrice() != null ? dto.getUnitPrice() : material.getUnitPrice());
        usage.setTotalPrice(usage.getUnitPrice() != null ?
                usage.getUnitPrice().multiply(dto.getUsageQuantity()) : null);
        usage.setCreateTime(LocalDateTime.now());
        save(usage);
    }

    public List<OrderMaterialUsage> getByOrderId(Long orderId) {
        LambdaQueryWrapper<OrderMaterialUsage> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(OrderMaterialUsage::getOrderId, orderId)
                .orderByDesc(OrderMaterialUsage::getCreateTime);
        return list(wrapper);
    }
}
