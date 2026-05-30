package com.amber.polish.service.impl;

import com.amber.polish.dto.ProfitLedgerDTO;
import com.amber.polish.entity.ProfitLedger;
import com.amber.polish.mapper.ProfitLedgerMapper;
import com.amber.polish.service.ProfitLedgerService;
import com.amber.polish.vo.ProfitStatisticsVO;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Slf4j
@Service
public class ProfitLedgerServiceImpl extends ServiceImpl<ProfitLedgerMapper, ProfitLedger> implements ProfitLedgerService {

    @Override
    public Page<ProfitLedger> getLedgerPage(int pageNum, int pageSize, Long categoryId, LocalDate startDate, LocalDate endDate) {
        Page<ProfitLedger> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<ProfitLedger> wrapper = new LambdaQueryWrapper<>();
        if (categoryId != null) {
            wrapper.eq(ProfitLedger::getCategoryId, categoryId);
        }
        if (startDate != null) {
            wrapper.ge(ProfitLedger::getLedgerDate, startDate);
        }
        if (endDate != null) {
            wrapper.le(ProfitLedger::getLedgerDate, endDate);
        }
        wrapper.orderByDesc(ProfitLedger::getLedgerDate);
        return this.page(page, wrapper);
    }

    @Override
    public boolean createLedger(ProfitLedgerDTO dto) {
        ProfitLedger profitLedger = new ProfitLedger();
        org.springframework.beans.BeanUtils.copyProperties(dto, profitLedger);
        return createLedger(profitLedger);
    }

    @Override
    public boolean createLedger(ProfitLedger profitLedger) {
        String ledgerNo = generateLedgerNo();
        profitLedger.setLedgerNo(ledgerNo);

        BigDecimal rawStoneCost = profitLedger.getRawStoneCost() != null ? profitLedger.getRawStoneCost() : BigDecimal.ZERO;
        BigDecimal materialCost = profitLedger.getMaterialCost() != null ? profitLedger.getMaterialCost() : BigDecimal.ZERO;
        BigDecimal laborCost = profitLedger.getLaborCost() != null ? profitLedger.getLaborCost() : BigDecimal.ZERO;
        
        BigDecimal totalCost = rawStoneCost.add(materialCost).add(laborCost);
        profitLedger.setTotalCost(totalCost);

        if (profitLedger.getOrderIncome() != null && totalCost.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal profitAmount = profitLedger.getOrderIncome().subtract(totalCost);
            profitLedger.setProfitAmount(profitAmount);
            BigDecimal profitRate = profitAmount.multiply(new BigDecimal("100")).divide(totalCost, 2, BigDecimal.ROUND_HALF_UP);
            profitLedger.setProfitRate(profitRate);
        } else {
            profitLedger.setProfitAmount(BigDecimal.ZERO);
            profitLedger.setProfitRate(BigDecimal.ZERO);
        }

        if (profitLedger.getLedgerDate() == null) {
            profitLedger.setLedgerDate(LocalDate.now());
        }

        return this.save(profitLedger);
    }

    private String generateLedgerNo() {
        String date = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        long count = this.count(new LambdaQueryWrapper<ProfitLedger>()
                .apply("DATE(create_time) = {0}", LocalDate.now()));
        return String.format("LED%s%04d", date, count + 1);
    }

    @Override
    public List<ProfitStatisticsVO> statisticsByCategory(LocalDate startDate, LocalDate endDate) {
        return this.baseMapper.statisticsByCategory(startDate, endDate);
    }
}
