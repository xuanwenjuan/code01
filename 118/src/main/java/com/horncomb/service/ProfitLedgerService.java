package com.horncomb.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.horncomb.annotation.OperationLog;
import com.horncomb.common.BusinessException;
import com.horncomb.dto.ProfitLedgerDTO;
import com.horncomb.entity.ProfitLedger;
import com.horncomb.mapper.ProfitLedgerMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class ProfitLedgerService {

    private final ProfitLedgerMapper profitLedgerMapper;

    public IPage<ProfitLedger> page(int pageNum, int pageSize, Long categoryId, String statisticalMonth) {
        Page<ProfitLedger> page = new Page<>(pageNum, pageSize);
        return profitLedgerMapper.selectPage(page,
                new LambdaQueryWrapper<ProfitLedger>()
                        .eq(categoryId != null, ProfitLedger::getCategoryId, categoryId)
                        .eq(statisticalMonth != null, ProfitLedger::getStatisticalMonth, statisticalMonth)
                        .orderByDesc(ProfitLedger::getCreateTime)
        );
    }

    public ProfitLedger getById(Long id) {
        ProfitLedger ledger = profitLedgerMapper.selectById(id);
        if (ledger == null) {
            throw new BusinessException("台账不存在");
        }
        return ledger;
    }

    @Transactional(rollbackFor = Exception.class)
    @OperationLog(module = "利润台账", type = "创建", description = "创建利润台账")
    public void create(ProfitLedgerDTO dto) {
        ProfitLedger ledger = new ProfitLedger();
        BeanUtils.copyProperties(dto, ledger);
        ledger.setId(null);
        ledger.setLedgerNo(generateLedgerNo());
        calculateProfit(ledger);
        profitLedgerMapper.insert(ledger);
    }

    @Transactional(rollbackFor = Exception.class)
    @OperationLog(module = "利润台账", type = "修改", description = "修改利润台账")
    public void update(ProfitLedgerDTO dto) {
        ProfitLedger ledger = profitLedgerMapper.selectById(dto.getId());
        if (ledger == null) {
            throw new BusinessException("台账不存在");
        }
        BeanUtils.copyProperties(dto, ledger);
        calculateProfit(ledger);
        profitLedgerMapper.updateById(ledger);
    }

    private void calculateProfit(ProfitLedger ledger) {
        BigDecimal materialCost = ledger.getMaterialCost() != null ? ledger.getMaterialCost() : BigDecimal.ZERO;
        BigDecimal consumableCost = ledger.getConsumableCost() != null ? ledger.getConsumableCost() : BigDecimal.ZERO;
        BigDecimal laborCost = ledger.getLaborCost() != null ? ledger.getLaborCost() : BigDecimal.ZERO;
        BigDecimal salesRevenue = ledger.getSalesRevenue() != null ? ledger.getSalesRevenue() : BigDecimal.ZERO;

        BigDecimal totalCost = materialCost.add(consumableCost).add(laborCost);
        BigDecimal grossProfit = salesRevenue.subtract(totalCost);
        BigDecimal grossProfitMargin = BigDecimal.ZERO;
        if (salesRevenue.compareTo(BigDecimal.ZERO) > 0) {
            grossProfitMargin = grossProfit.divide(salesRevenue, 4, RoundingMode.HALF_UP)
                    .multiply(new BigDecimal("100"))
                    .setScale(2, RoundingMode.HALF_UP);
        }

        ledger.setTotalCost(totalCost);
        ledger.setGrossProfit(grossProfit);
        ledger.setGrossProfitMargin(grossProfitMargin);

        if (ledger.getProductionQuantity() == null) {
            ledger.setProductionQuantity(0);
        }
        if (ledger.getSalesQuantity() == null) {
            ledger.setSalesQuantity(0);
        }
    }

    private String generateLedgerNo() {
        String date = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        Random random = new Random();
        int suffix = random.nextInt(1000);
        return "PL" + date + String.format("%03d", suffix);
    }

    @Transactional(rollbackFor = Exception.class)
    @OperationLog(module = "利润台账", type = "删除", description = "删除利润台账")
    public void delete(Long id) {
        profitLedgerMapper.deleteById(id);
    }
}
