package com.woodendoor.production.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.woodendoor.production.annotation.OperationLog;
import com.woodendoor.production.entity.CostDetail;
import com.woodendoor.production.entity.ProductionCost;
import com.woodendoor.production.entity.ProductionOrder;
import com.woodendoor.production.exception.BusinessException;
import com.woodendoor.production.mapper.CostDetailMapper;
import com.woodendoor.production.mapper.ProductionCostMapper;
import com.woodendoor.production.mapper.ProductionOrderMapper;
import com.woodendoor.production.util.RedisUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class ProductionCostService extends ServiceImpl<ProductionCostMapper, ProductionCost> {

    private final CostDetailMapper costDetailMapper;
    private final ProductionOrderMapper productionOrderMapper;
    private final RedisUtil redisUtil;

    private static final String COST_CACHE_KEY = "cost:";

    @Transactional(rollbackFor = Exception.class)
    @OperationLog(module = "成本核算", operation = "创建成本核算")
    public void createCost(ProductionCost cost) {
        ProductionOrder order = productionOrderMapper.selectById(cost.getOrderId());
        if (order == null) {
            throw new BusinessException("工单不存在");
        }

        if (order.getStatus() != 3) {
            throw new BusinessException("工单未完成，无法核算成本");
        }

        ProductionCost existingCost = getByOrderId(cost.getOrderId());
        if (existingCost != null) {
            throw new BusinessException("该工单已核算成本");
        }

        cost.setOrderNo(order.getOrderNo());

        if (cost.getDetailList() != null && !cost.getDetailList().isEmpty()) {
            calculateCostFromDetails(cost);
        } else {
            calculateSummaryCost(cost);
        }

        save(cost);

        if (cost.getDetailList() != null && !cost.getDetailList().isEmpty()) {
            for (CostDetail detail : cost.getDetailList()) {
                detail.setCostId(cost.getId());
                detail.setOrderId(cost.getOrderId());
                detail.setOrderNo(cost.getOrderNo());
                costDetailMapper.insert(detail);
            }
        }

        clearCostCache(cost.getId(), cost.getOrderId());
    }

    private void calculateCostFromDetails(ProductionCost cost) {
        BigDecimal woodCost = BigDecimal.ZERO;
        BigDecimal hardwareCost = BigDecimal.ZERO;
        BigDecimal paintCost = BigDecimal.ZERO;
        BigDecimal laborCost = BigDecimal.ZERO;
        BigDecimal scrapCost = BigDecimal.ZERO;
        
        BigDecimal woodWaste = BigDecimal.ZERO;
        BigDecimal hardwareWaste = BigDecimal.ZERO;
        BigDecimal paintWaste = BigDecimal.ZERO;
        BigDecimal totalWasteCost = BigDecimal.ZERO;

        BigDecimal totalWoodPlanned = BigDecimal.ZERO;
        BigDecimal totalWoodActual = BigDecimal.ZERO;
        BigDecimal totalHardwarePlanned = BigDecimal.ZERO;
        BigDecimal totalHardwareActual = BigDecimal.ZERO;
        BigDecimal totalPaintPlanned = BigDecimal.ZERO;
        BigDecimal totalPaintActual = BigDecimal.ZERO;

        for (CostDetail detail : cost.getDetailList()) {
            if (detail.getUnitPrice() == null) {
                detail.setUnitPrice(BigDecimal.ZERO);
            }
            if (detail.getPlannedQuantity() == null) {
                detail.setPlannedQuantity(BigDecimal.ZERO);
            }
            if (detail.getActualQuantity() == null) {
                detail.setActualQuantity(BigDecimal.ZERO);
            }

            BigDecimal wasteQty = detail.getActualQuantity().subtract(detail.getPlannedQuantity());
            if (wasteQty.compareTo(BigDecimal.ZERO) > 0) {
                detail.setWasteQuantity(wasteQty);
            } else {
                detail.setWasteQuantity(BigDecimal.ZERO);
            }

            if (detail.getPlannedQuantity().compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal rate = detail.getWasteQuantity()
                        .divide(detail.getPlannedQuantity(), 4, RoundingMode.HALF_UP)
                        .multiply(new BigDecimal("100"));
                detail.setWasteRate(rate);
            } else {
                detail.setWasteRate(BigDecimal.ZERO);
            }

            detail.setPlannedTotalPrice(detail.getUnitPrice().multiply(detail.getPlannedQuantity()));
            detail.setActualTotalPrice(detail.getUnitPrice().multiply(detail.getActualQuantity()));
            detail.setWasteTotalPrice(detail.getUnitPrice().multiply(detail.getWasteQuantity()));

            switch (detail.getCostType()) {
                case 1:
                    woodCost = woodCost.add(detail.getActualTotalPrice());
                    woodWaste = woodWaste.add(detail.getWasteTotalPrice());
                    totalWoodPlanned = totalWoodPlanned.add(detail.getPlannedQuantity());
                    totalWoodActual = totalWoodActual.add(detail.getActualQuantity());
                    detail.setCostTypeName("木材成本");
                    break;
                case 2:
                    hardwareCost = hardwareCost.add(detail.getActualTotalPrice());
                    hardwareWaste = hardwareWaste.add(detail.getWasteTotalPrice());
                    totalHardwarePlanned = totalHardwarePlanned.add(detail.getPlannedQuantity());
                    totalHardwareActual = totalHardwareActual.add(detail.getActualQuantity());
                    detail.setCostTypeName("五金成本");
                    break;
                case 3:
                    paintCost = paintCost.add(detail.getActualTotalPrice());
                    paintWaste = paintWaste.add(detail.getWasteTotalPrice());
                    totalPaintPlanned = totalPaintPlanned.add(detail.getPlannedQuantity());
                    totalPaintActual = totalPaintActual.add(detail.getActualQuantity());
                    detail.setCostTypeName("油漆成本");
                    break;
                case 4:
                    laborCost = laborCost.add(detail.getActualTotalPrice());
                    detail.setCostTypeName("人工成本");
                    break;
                case 5:
                    scrapCost = scrapCost.add(detail.getActualTotalPrice());
                    detail.setCostTypeName("报废成本");
                    break;
                default:
                    break;
            }
        }

        cost.setWoodCost(woodCost);
        cost.setHardwareCost(hardwareCost);
        cost.setPaintCost(paintCost);
        cost.setLaborCost(laborCost);
        cost.setScrapCost(scrapCost);

        cost.setWoodWaste(woodWaste);
        cost.setHardwareWaste(hardwareWaste);
        cost.setPaintWaste(paintWaste);
        totalWasteCost = woodWaste.add(hardwareWaste).add(paintWaste);
        cost.setTotalWasteCost(totalWasteCost);

        if (totalWoodPlanned.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal woodWasteQty = totalWoodActual.subtract(totalWoodPlanned);
            if (woodWasteQty.compareTo(BigDecimal.ZERO) > 0) {
                cost.setWoodWasteRate(woodWasteQty.divide(totalWoodPlanned, 4, RoundingMode.HALF_UP)
                        .multiply(new BigDecimal("100")));
            } else {
                cost.setWoodWasteRate(BigDecimal.ZERO);
            }
        } else {
            cost.setWoodWasteRate(BigDecimal.ZERO);
        }

        if (totalHardwarePlanned.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal hardwareWasteQty = totalHardwareActual.subtract(totalHardwarePlanned);
            if (hardwareWasteQty.compareTo(BigDecimal.ZERO) > 0) {
                cost.setHardwareWasteRate(hardwareWasteQty.divide(totalHardwarePlanned, 4, RoundingMode.HALF_UP)
                        .multiply(new BigDecimal("100")));
            } else {
                cost.setHardwareWasteRate(BigDecimal.ZERO);
            }
        } else {
            cost.setHardwareWasteRate(BigDecimal.ZERO);
        }

        if (totalPaintPlanned.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal paintWasteQty = totalPaintActual.subtract(totalPaintPlanned);
            if (paintWasteQty.compareTo(BigDecimal.ZERO) > 0) {
                cost.setPaintWasteRate(paintWasteQty.divide(totalPaintPlanned, 4, RoundingMode.HALF_UP)
                        .multiply(new BigDecimal("100")));
            } else {
                cost.setPaintWasteRate(BigDecimal.ZERO);
            }
        } else {
            cost.setPaintWasteRate(BigDecimal.ZERO);
        }

        BigDecimal totalCost = woodCost.add(hardwareCost).add(paintCost).add(laborCost).add(scrapCost);
        cost.setTotalCost(totalCost);
        cost.setActualCost(totalCost);
    }

    private void calculateSummaryCost(ProductionCost cost) {
        BigDecimal totalCost = BigDecimal.ZERO;
        if (cost.getWoodCost() != null) {
            totalCost = totalCost.add(cost.getWoodCost());
        }
        if (cost.getHardwareCost() != null) {
            totalCost = totalCost.add(cost.getHardwareCost());
        }
        if (cost.getPaintCost() != null) {
            totalCost = totalCost.add(cost.getPaintCost());
        }
        if (cost.getLaborCost() != null) {
            totalCost = totalCost.add(cost.getLaborCost());
        }
        if (cost.getScrapCost() != null) {
            totalCost = totalCost.add(cost.getScrapCost());
        }
        cost.setTotalCost(totalCost);
        cost.setActualCost(totalCost);

        if (cost.getWoodWaste() == null) cost.setWoodWaste(BigDecimal.ZERO);
        if (cost.getHardwareWaste() == null) cost.setHardwareWaste(BigDecimal.ZERO);
        if (cost.getPaintWaste() == null) cost.setPaintWaste(BigDecimal.ZERO);
        if (cost.getWoodWasteRate() == null) cost.setWoodWasteRate(BigDecimal.ZERO);
        if (cost.getHardwareWasteRate() == null) cost.setHardwareWasteRate(BigDecimal.ZERO);
        if (cost.getPaintWasteRate() == null) cost.setPaintWasteRate(BigDecimal.ZERO);
        
        BigDecimal totalWaste = cost.getWoodWaste().add(cost.getHardwareWaste()).add(cost.getPaintWaste());
        cost.setTotalWasteCost(totalWaste);
    }

    public Page<ProductionCost> page(Integer pageNum, Integer pageSize, Long orderId) {
        Page<ProductionCost> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<ProductionCost> wrapper = new LambdaQueryWrapper<>();
        if (orderId != null) {
            wrapper.eq(ProductionCost::getOrderId, orderId);
        }
        wrapper.orderByDesc(ProductionCost::getCreateTime);
        return page(page, wrapper);
    }

    public List<CostDetail> getDetailList(Long costId) {
        return costDetailMapper.selectList(new LambdaQueryWrapper<CostDetail>()
                .eq(CostDetail::getCostId, costId)
                .orderByAsc(CostDetail::getCostType));
    }

    @SuppressWarnings("unchecked")
    public ProductionCost getByOrderId(Long orderId) {
        String cacheKey = COST_CACHE_KEY + "order:" + orderId;
        ProductionCost cached = (ProductionCost) redisUtil.get(cacheKey);
        if (cached != null) {
            return cached;
        }
        ProductionCost cost = getOne(new LambdaQueryWrapper<ProductionCost>()
                .eq(ProductionCost::getOrderId, orderId));
        if (cost != null) {
            redisUtil.set(cacheKey, cost, 1, TimeUnit.HOURS);
        }
        return cost;
    }

    @Transactional(rollbackFor = Exception.class)
    @OperationLog(module = "成本核算", operation = "更新成本核算")
    public void updateCost(ProductionCost cost) {
        ProductionCost existing = getById(cost.getId());
        if (existing == null) {
            throw new BusinessException("成本记录不存在");
        }

        if (cost.getDetailList() != null && !cost.getDetailList().isEmpty()) {
            calculateCostFromDetails(cost);
        } else {
            calculateSummaryCost(cost);
        }

        updateById(cost);

        if (cost.getDetailList() != null && !cost.getDetailList().isEmpty()) {
            costDetailMapper.delete(new LambdaQueryWrapper<CostDetail>()
                    .eq(CostDetail::getCostId, cost.getId()));
            for (CostDetail detail : cost.getDetailList()) {
                detail.setCostId(cost.getId());
                detail.setOrderId(cost.getOrderId());
                detail.setOrderNo(cost.getOrderNo());
                costDetailMapper.insert(detail);
            }
        }

        clearCostCache(cost.getId(), cost.getOrderId());
    }

    private void clearCostCache(Long costId, Long orderId) {
        redisUtil.delete(COST_CACHE_KEY + costId);
        redisUtil.delete(COST_CACHE_KEY + "order:" + orderId);
    }
}
