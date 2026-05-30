package com.zongshi.brush.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.zongshi.brush.dto.CostRevenueLedgerDTO;
import com.zongshi.brush.entity.*;
import com.zongshi.brush.exception.BusinessException;
import com.zongshi.brush.mapper.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CostRevenueLedgerService extends ServiceImpl<CostRevenueLedgerMapper, CostRevenueLedger> {

    private final ProductionOrderMapper productionOrderMapper;
    private final OrderMaterialMapper orderMaterialMapper;
    private final BrushCategoryMapper brushCategoryMapper;

    @Transactional(rollbackFor = Exception.class)
    public Long createLedger(CostRevenueLedgerDTO dto) {
        LambdaQueryWrapper<CostRevenueLedger> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(CostRevenueLedger::getLedgerNo, dto.getLedgerNo());
        wrapper.eq(CostRevenueLedger::getIsDeleted, 0);
        Long count = this.baseMapper.selectCount(wrapper);
        if (count > 0) {
            throw new BusinessException("台账编号已存在");
        }

        CostRevenueLedger ledger = new CostRevenueLedger();
        BeanUtils.copyProperties(dto, ledger);

        calculateTotalCostAndProfit(ledger);

        this.baseMapper.insert(ledger);
        return ledger.getId();
    }

    @Transactional(rollbackFor = Exception.class)
    public Long generateLedgerFromOrder(Long orderId) {
        ProductionOrder order = productionOrderMapper.selectById(orderId);
        if (order == null || order.getIsDeleted() == 1) {
            throw new BusinessException("工单不存在");
        }
        if (order.getOrderStatus() != 8) {
            throw new BusinessException("仅已完成的工单可生成台账");
        }

        String ledgerNo = "LDG" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));

        CostRevenueLedger ledger = new CostRevenueLedger();
        ledger.setLedgerNo(ledgerNo);
        ledger.setLedgerDate(LocalDate.now());
        ledger.setCategoryId(order.getCategoryId());
        ledger.setBrushName(order.getBrushName());
        ledger.setProductionQuantity(order.getActualQuantity());
        ledger.setLaborCost(order.getLaborCost() != null ? order.getLaborCost() : BigDecimal.ZERO);
        ledger.setProcessLossCost(order.getProcessLoss() != null ? order.getProcessLoss() : BigDecimal.ZERO);

        List<OrderMaterial> materials = orderMaterialMapper.selectByOrderId(orderId);
        BigDecimal materialCost = BigDecimal.ZERO;
        if (!CollectionUtils.isEmpty(materials)) {
            materialCost = materials.stream()
                    .map(OrderMaterial::getTotalPrice)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
        }
        ledger.setMaterialCost(materialCost);

        calculateTotalCostAndProfit(ledger);

        this.baseMapper.insert(ledger);
        return ledger.getId();
    }

    @Transactional(rollbackFor = Exception.class)
    public void updateLedger(CostRevenueLedgerDTO dto) {
        if (dto.getId() == null) {
            throw new BusinessException("台账ID不能为空");
        }

        CostRevenueLedger exist = this.baseMapper.selectById(dto.getId());
        if (exist == null || exist.getIsDeleted() == 1) {
            throw new BusinessException("台账不存在");
        }

        CostRevenueLedger ledger = new CostRevenueLedger();
        BeanUtils.copyProperties(dto, ledger);
        calculateTotalCostAndProfit(ledger);

        this.baseMapper.updateById(ledger);
    }

    @Transactional(rollbackFor = Exception.class)
    public void deleteLedger(Long id) {
        CostRevenueLedger ledger = this.baseMapper.selectById(id);
        if (ledger == null || ledger.getIsDeleted() == 1) {
            throw new BusinessException("台账不存在");
        }
        this.baseMapper.deleteById(id);
    }

    public CostRevenueLedger getLedgerById(Long id) {
        CostRevenueLedger ledger = this.baseMapper.selectById(id);
        if (ledger == null || ledger.getIsDeleted() == 1) {
            throw new BusinessException("台账不存在");
        }
        return ledger;
    }

    public Map<String, Object> getStatistics(LocalDate startDate, LocalDate endDate) {
        Map<String, Object> result = new HashMap<>();

        BigDecimal totalMaterialCost = this.baseMapper.selectTotalMaterialCost(startDate, endDate);
        BigDecimal totalLaborCost = this.baseMapper.selectTotalLaborCost(startDate, endDate);
        BigDecimal totalRevenue = this.baseMapper.selectTotalRevenue(startDate, endDate);
        Integer totalProduction = this.baseMapper.selectTotalProductionQuantity(startDate, endDate);

        result.put("totalMaterialCost", totalMaterialCost != null ? totalMaterialCost : BigDecimal.ZERO);
        result.put("totalLaborCost", totalLaborCost != null ? totalLaborCost : BigDecimal.ZERO);
        result.put("totalRevenue", totalRevenue != null ? totalRevenue : BigDecimal.ZERO);
        result.put("totalProduction", totalProduction != null ? totalProduction : 0);

        BigDecimal totalCost = (totalMaterialCost != null ? totalMaterialCost : BigDecimal.ZERO)
                .add(totalLaborCost != null ? totalLaborCost : BigDecimal.ZERO);
        BigDecimal profit = (totalRevenue != null ? totalRevenue : BigDecimal.ZERO).subtract(totalCost);
        result.put("totalCost", totalCost);
        result.put("profit", profit);

        return result;
    }

    private void calculateTotalCostAndProfit(CostRevenueLedger ledger) {
        BigDecimal materialCost = ledger.getMaterialCost() != null ? ledger.getMaterialCost() : BigDecimal.ZERO;
        BigDecimal laborCost = ledger.getLaborCost() != null ? ledger.getLaborCost() : BigDecimal.ZERO;
        BigDecimal processLossCost = ledger.getProcessLossCost() != null ? ledger.getProcessLossCost() : BigDecimal.ZERO;

        BigDecimal totalCost = materialCost.add(laborCost).add(processLossCost);
        ledger.setTotalCost(totalCost);

        BigDecimal revenue = ledger.getSalesRevenue() != null ? ledger.getSalesRevenue() : BigDecimal.ZERO;
        ledger.setProfit(revenue.subtract(totalCost));
    }
}
