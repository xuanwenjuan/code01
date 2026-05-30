package com.aromatherapy.service;

import com.aromatherapy.entity.*;
import com.aromatherapy.exception.BusinessException;
import com.aromatherapy.mapper.*;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CostLedgerService {

    private final CostLedgerMapper costLedgerMapper;
    private final ProductionWorkOrderMapper workOrderMapper;
    private final WorkOrderFormulaMapper formulaMapper;
    private final RawMaterialMapper rawMaterialMapper;
    private final AromaCategoryMapper categoryMapper;

    public List<CostLedger> list(Long categoryId, Integer settlementStatus) {
        LambdaQueryWrapper<CostLedger> wrapper = new LambdaQueryWrapper<>();
        if (categoryId != null) {
            wrapper.eq(CostLedger::getCategoryId, categoryId);
        }
        if (settlementStatus != null) {
            wrapper.eq(CostLedger::getSettlementStatus, settlementStatus);
        }
        wrapper.orderByDesc(CostLedger::getCreateTime);
        return costLedgerMapper.selectList(wrapper);
    }

    public CostLedger getById(Long id) {
        return costLedgerMapper.selectById(id);
    }

    @Transactional(rollbackFor = Exception.class)
    public void generateLedger(Long workOrderId) {
        ProductionWorkOrder workOrder = workOrderMapper.selectById(workOrderId);
        if (workOrder == null) {
            throw new BusinessException("工单不存在");
        }

        AromaCategory category = null;
        if (workOrder.getCategoryId() != null) {
            category = categoryMapper.selectById(workOrder.getCategoryId());
        }

        List<WorkOrderFormula> formulas = formulaMapper.selectByWorkOrderId(workOrderId);

        BigDecimal totalMaterialCost = BigDecimal.ZERO;
        BigDecimal totalMaterialConsumption = BigDecimal.ZERO;
        String materialOrigin = "";

        for (WorkOrderFormula formula : formulas) {
            RawMaterial material = rawMaterialMapper.selectById(formula.getRawMaterialId());
            if (material != null) {
                BigDecimal materialCost = formula.getDosage().multiply(material.getUnitPrice());
                totalMaterialCost = totalMaterialCost.add(materialCost);
                totalMaterialConsumption = totalMaterialConsumption.add(formula.getDosage());
                if (!materialOrigin.contains(material.getOrigin())) {
                    materialOrigin += material.getOrigin() + " ";
                }
            }
        }

        BigDecimal lossRate = new BigDecimal("0.05");
        BigDecimal mixingLoss = totalMaterialConsumption.multiply(lossRate);
        BigDecimal mixingLossCost = totalMaterialCost.multiply(lossRate);

        BigDecimal laborCost = workOrder.getTargetQuantity().multiply(new BigDecimal("0.1"));

        BigDecimal totalCost = totalMaterialCost.add(mixingLossCost).add(laborCost);

        BigDecimal supplyPrice = totalCost.multiply(new BigDecimal("1.5"));

        BigDecimal profit = supplyPrice.subtract(totalCost);
        BigDecimal profitMargin = totalCost.compareTo(BigDecimal.ZERO) > 0
                ? profit.divide(totalCost, 4, RoundingMode.HALF_UP).multiply(new BigDecimal("100"))
                : BigDecimal.ZERO;

        CostLedger ledger = new CostLedger();
        ledger.setLedgerNo("LD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        ledger.setWorkOrderId(workOrderId);
        ledger.setCategoryId(workOrder.getCategoryId());
        ledger.setCategoryName(category != null ? category.getCategoryName() : "");
        ledger.setMaterialOrigin(materialOrigin.trim());
        ledger.setTotalMaterialCost(totalMaterialCost);
        ledger.setTotalMaterialConsumption(totalMaterialConsumption);
        ledger.setMixingLoss(mixingLoss);
        ledger.setMixingLossCost(mixingLossCost);
        ledger.setLaborCost(laborCost);
        ledger.setTotalCost(totalCost);
        ledger.setSupplyQuantity(workOrder.getActualQuantity());
        ledger.setSupplyPrice(supplyPrice);
        ledger.setProfit(profit);
        ledger.setProfitMargin(profitMargin);
        ledger.setSettlementStatus(0);
        ledger.setRemark("自动生成台账");

        costLedgerMapper.insert(ledger);
    }

    @Transactional(rollbackFor = Exception.class)
    public void settle(Long id) {
        CostLedger ledger = costLedgerMapper.selectById(id);
        if (ledger == null) {
            throw new BusinessException("台账不存在");
        }
        if (ledger.getSettlementStatus() == 1) {
            throw new BusinessException("台账已结算");
        }

        ledger.setSettlementStatus(1);
        ledger.setSettlementTime(LocalDateTime.now());
        costLedgerMapper.updateById(ledger);
    }

    public List<CostLedger> statisticByCategory(Long categoryId) {
        return costLedgerMapper.selectList(
                new LambdaQueryWrapper<CostLedger>()
                        .eq(categoryId != null, CostLedger::getCategoryId, categoryId)
                        .eq(CostLedger::getSettlementStatus, 1)
        );
    }
}
