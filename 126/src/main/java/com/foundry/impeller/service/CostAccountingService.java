package com.foundry.impeller.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.foundry.impeller.annotation.OperationLog;
import com.foundry.impeller.entity.CostAccounting;
import com.foundry.impeller.mapper.CostAccountingMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CostAccountingService {

    private final CostAccountingMapper costAccountingMapper;

    public Page<CostAccounting> list(int page, int size, LocalDate startDate, LocalDate endDate) {
        LambdaQueryWrapper<CostAccounting> wrapper = new LambdaQueryWrapper<>();
        if (startDate != null) {
            wrapper.ge(CostAccounting::getStatisticsDate, startDate);
        }
        if (endDate != null) {
            wrapper.le(CostAccounting::getStatisticsDate, endDate);
        }
        wrapper.orderByDesc(CostAccounting::getStatisticsDate);
        return costAccountingMapper.selectPage(new Page<>(page, size), wrapper);
    }

    public List<CostAccounting> listByDate(LocalDate date) {
        LambdaQueryWrapper<CostAccounting> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(CostAccounting::getStatisticsDate, date);
        return costAccountingMapper.selectList(wrapper);
    }

    public CostAccounting getById(Long id) {
        return costAccountingMapper.selectById(id);
    }

    @Transactional(rollbackFor = Exception.class)
    public void create(CostAccounting costAccounting) {
        calculateTotalCost(costAccounting);
        costAccountingMapper.insert(costAccounting);
    }

    @Transactional(rollbackFor = Exception.class)
    @OperationLog(value = "更新成本台账", module = "成本管理")
    public void update(CostAccounting costAccounting) {
        calculateTotalCost(costAccounting);
        costAccountingMapper.updateById(costAccounting);
    }

    private void calculateTotalCost(CostAccounting costAccounting) {
        BigDecimal total = BigDecimal.ZERO;
        if (costAccounting.getRawMaterialCost() != null) {
            total = total.add(costAccounting.getRawMaterialCost());
        }
        if (costAccounting.getSandMaterialCost() != null) {
            total = total.add(costAccounting.getSandMaterialCost());
        }
        if (costAccounting.getEnergyCost() != null) {
            total = total.add(costAccounting.getEnergyCost());
        }
        if (costAccounting.getLaborCost() != null) {
            total = total.add(costAccounting.getLaborCost());
        }
        if (costAccounting.getDefectiveCost() != null) {
            total = total.add(costAccounting.getDefectiveCost());
        }
        costAccounting.setTotalCost(total);
    }

    @Transactional(rollbackFor = Exception.class)
    @OperationLog(value = "删除成本台账", module = "成本管理")
    public void delete(Long id) {
        costAccountingMapper.deleteById(id);
    }
}
