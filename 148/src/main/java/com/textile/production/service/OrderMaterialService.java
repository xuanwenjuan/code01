package com.textile.production.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.textile.production.common.Result;
import com.textile.production.dto.MaterialPickDTO;
import com.textile.production.dto.OrderMaterialDTO;
import com.textile.production.entity.OrderMaterial;
import com.textile.production.entity.RawMaterial;
import com.textile.production.entity.RawMaterialBatch;
import com.textile.production.mapper.OrderMaterialMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderMaterialService extends ServiceImpl<OrderMaterialMapper, OrderMaterial> {

    private final RawMaterialService materialService;
    private final RawMaterialBatchService batchService;
    private final ProductionLogService logService;
    private final ProductionCostService costService;

    @Transactional(rollbackFor = Exception.class)
    public void addOrderMaterial(Long orderId, OrderMaterialDTO dto) {
        RawMaterial material = materialService.getById(dto.getMaterialId());
        if (material == null) {
            return;
        }

        OrderMaterial orderMaterial = new OrderMaterial();
        orderMaterial.setOrderId(orderId);
        orderMaterial.setMaterialId(dto.getMaterialId());
        orderMaterial.setBatchId(dto.getBatchId());
        orderMaterial.setPlanQuantity(dto.getPlanQuantity());
        orderMaterial.setActualQuantity(BigDecimal.ZERO);
        orderMaterial.setUnit(material.getUnit());
        orderMaterial.setUnitPrice(dto.getUnitPrice());
        orderMaterial.setTotalPrice(dto.getUnitPrice() != null ?
                dto.getPlanQuantity().multiply(dto.getUnitPrice()) : BigDecimal.ZERO);
        save(orderMaterial);
    }

    public Result<List<OrderMaterial>> getMaterialsByOrderId(Long orderId) {
        LambdaQueryWrapper<OrderMaterial> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(OrderMaterial::getOrderId, orderId);
        return Result.success(list(wrapper));
    }

    @Transactional(rollbackFor = Exception.class)
    public Result<Void> pickMaterial(MaterialPickDTO dto) {
        RawMaterial material = materialService.getById(dto.getMaterialId());
        if (material == null) {
            return Result.fail("原料不存在");
        }

        BigDecimal remainQuantity = dto.getQuantity();
        BigDecimal totalPrice = BigDecimal.ZERO;

        if (dto.getBatchId() != null) {
            RawMaterialBatch batch = batchService.getById(dto.getBatchId());
            if (batch == null || batch.getStatus() == 0) {
                return Result.fail("批次不存在或已用完");
            }
            if (batch.getQuantity().compareTo(dto.getQuantity()) < 0) {
                return Result.fail("批次库存不足");
            }

            batchService.useBatch(dto.getBatchId(), dto.getQuantity());
            if (batch.getUnitPrice() != null) {
                totalPrice = dto.getQuantity().multiply(batch.getUnitPrice());
            }
        } else {
            List<RawMaterialBatch> batches = batchService.getAvailableBatches(dto.getMaterialId()).getData();
            if (batches == null || batches.isEmpty()) {
                return Result.fail("没有可用的批次库存");
            }

            BigDecimal totalAvailable = batches.stream()
                    .map(RawMaterialBatch::getQuantity)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            if (totalAvailable.compareTo(dto.getQuantity()) < 0) {
                return Result.fail("总库存不足，现有库存：" + totalAvailable);
            }

            for (RawMaterialBatch batch : batches) {
                if (remainQuantity.compareTo(BigDecimal.ZERO) <= 0) {
                    break;
                }

                BigDecimal useQuantity = remainQuantity.min(batch.getQuantity());
                batchService.useBatch(batch.getId(), useQuantity);
                if (batch.getUnitPrice() != null) {
                    totalPrice = totalPrice.add(useQuantity.multiply(batch.getUnitPrice()));
                }
                remainQuantity = remainQuantity.subtract(useQuantity);
            }
        }

        LambdaQueryWrapper<OrderMaterial> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(OrderMaterial::getOrderId, dto.getOrderId())
                .eq(OrderMaterial::getMaterialId, dto.getMaterialId());
        OrderMaterial orderMaterial = getOne(wrapper);

        if (orderMaterial == null) {
            orderMaterial = new OrderMaterial();
            orderMaterial.setOrderId(dto.getOrderId());
            orderMaterial.setMaterialId(dto.getMaterialId());
            orderMaterial.setPlanQuantity(dto.getQuantity());
            orderMaterial.setActualQuantity(dto.getQuantity());
            orderMaterial.setUnit(material.getUnit());
            orderMaterial.setUnitPrice(totalPrice.compareTo(BigDecimal.ZERO) > 0 ?
                    totalPrice.divide(dto.getQuantity(), 4, java.math.RoundingMode.HALF_UP) : BigDecimal.ZERO);
            orderMaterial.setTotalPrice(totalPrice);
            save(orderMaterial);
        } else {
            if (orderMaterial.getPlanQuantity().compareTo(orderMaterial.getActualQuantity().add(dto.getQuantity())) < 0) {
                orderMaterial.setPlanQuantity(orderMaterial.getActualQuantity().add(dto.getQuantity()));
            }
            orderMaterial.setActualQuantity(orderMaterial.getActualQuantity().add(dto.getQuantity()));
            if (totalPrice.compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal newTotal = orderMaterial.getTotalPrice().add(totalPrice);
                orderMaterial.setTotalPrice(newTotal);
                orderMaterial.setUnitPrice(newTotal.divide(orderMaterial.getActualQuantity(), 4, java.math.RoundingMode.HALF_UP));
            }
            updateById(orderMaterial);
        }

        costService.calculateCost(dto.getOrderId());

        logService.log(dto.getOrderId(), null, "领料",
                "领用原料：" + material.getName() + "，数量：" + dto.getQuantity() + material.getUnit(),
                null, null);

        return Result.success("领料成功");
    }

    @Transactional(rollbackFor = Exception.class)
    public Result<Void> useMaterial(Long orderMaterialId, BigDecimal quantity) {
        OrderMaterial orderMaterial = getById(orderMaterialId);
        if (orderMaterial == null) {
            return Result.fail("工单用料记录不存在");
        }

        if (orderMaterial.getPlanQuantity().compareTo(orderMaterial.getActualQuantity().add(quantity)) < 0) {
            return Result.fail("领用数量超出计划用量");
        }

        orderMaterial.setActualQuantity(orderMaterial.getActualQuantity().add(quantity));
        if (orderMaterial.getUnitPrice() != null) {
            orderMaterial.setTotalPrice(orderMaterial.getActualQuantity().multiply(orderMaterial.getUnitPrice()));
        }
        updateById(orderMaterial);

        return Result.success("领料成功");
    }
}
