package com.ancientpaper.service;

import com.ancientpaper.dto.FinanceLedgerDTO;
import com.ancientpaper.entity.FinanceLedger;
import com.ancientpaper.entity.PaperCategory;
import com.ancientpaper.exception.BusinessException;
import com.ancientpaper.mapper.FinanceLedgerMapper;
import com.ancientpaper.mapper.PaperCategoryMapper;
import com.ancientpaper.vo.FinanceReportVO;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FinanceLedgerService {

    private final FinanceLedgerMapper ledgerMapper;
    private final PaperCategoryMapper categoryMapper;

    public IPage<FinanceLedger> getLedgerPage(Integer pageNum, Integer pageSize, Long categoryId, LocalDate startDate, LocalDate endDate) {
        Page<FinanceLedger> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<FinanceLedger> wrapper = new LambdaQueryWrapper<>();
        if (categoryId != null) {
            wrapper.eq(FinanceLedger::getCategoryId, categoryId);
        }
        if (startDate != null) {
            wrapper.ge(FinanceLedger::getStatDate, startDate);
        }
        if (endDate != null) {
            wrapper.le(FinanceLedger::getStatDate, endDate);
        }
        wrapper.orderByDesc(FinanceLedger::getStatDate);
        return ledgerMapper.selectPage(page, wrapper);
    }

    public FinanceLedger getLedgerById(Long id) {
        return ledgerMapper.selectById(id);
    }

    @Transactional(rollbackFor = Exception.class)
    public void addLedger(FinanceLedgerDTO dto) {
        PaperCategory category = categoryMapper.selectById(dto.getCategoryId());
        if (category == null) {
            throw new BusinessException("纸品分类不存在");
        }
        FinanceLedger ledger = new FinanceLedger();
        BeanUtils.copyProperties(dto, ledger);
        String ledgerNo = generateLedgerNo();
        ledger.setLedgerNo(ledgerNo);
        calculateProfit(ledger);
        ledgerMapper.insert(ledger);
    }

    @Transactional(rollbackFor = Exception.class)
    public void updateLedger(FinanceLedgerDTO dto) {
        FinanceLedger ledger = ledgerMapper.selectById(dto.getId());
        if (ledger == null) {
            throw new BusinessException("台账记录不存在");
        }
        BeanUtils.copyProperties(dto, ledger);
        calculateProfit(ledger);
        ledgerMapper.updateById(ledger);
    }

    public void deleteLedger(Long id) {
        ledgerMapper.deleteById(id);
    }

    private void calculateProfit(FinanceLedger ledger) {
        BigDecimal totalCost = ledger.getMaterialCost()
                .add(ledger.getLaborCost())
                .add(ledger.getWorkHourCost());
        BigDecimal profit = ledger.getSalesRevenue().subtract(totalCost);
        ledger.setTotalProfit(profit);
    }

    private String generateLedgerNo() {
        String dateStr = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        Long count = ledgerMapper.selectCount(new LambdaQueryWrapper<FinanceLedger>()
                .apply("DATE_FORMAT(create_time, '%Y%m%d') = {0}", dateStr));
        return "FL" + dateStr + String.format("%04d", count + 1);
    }

    public List<FinanceReportVO> generateReport(LocalDate startDate, LocalDate endDate) {
        List<PaperCategory> categories = categoryMapper.selectList(new LambdaQueryWrapper<>());
        List<FinanceReportVO> reports = new ArrayList<>();
        
        for (PaperCategory category : categories) {
            List<FinanceLedger> ledgers = ledgerMapper.selectList(new LambdaQueryWrapper<FinanceLedger>()
                    .eq(FinanceLedger::getCategoryId, category.getId())
                    .ge(startDate != null, FinanceLedger::getStatDate, startDate)
                    .le(endDate != null, FinanceLedger::getStatDate, endDate));
            
            FinanceReportVO report = new FinanceReportVO();
            report.setCategoryId(category.getId());
            report.setCategoryName(category.getCategoryName());
            
            BigDecimal totalMaterialCost = BigDecimal.ZERO;
            BigDecimal totalLaborCost = BigDecimal.ZERO;
            BigDecimal totalWorkHourCost = BigDecimal.ZERO;
            BigDecimal totalSalesRevenue = BigDecimal.ZERO;
            BigDecimal totalProductionQuantity = BigDecimal.ZERO;
            BigDecimal totalSalesQuantity = BigDecimal.ZERO;
            
            for (FinanceLedger ledger : ledgers) {
                totalMaterialCost = totalMaterialCost.add(ledger.getMaterialCost());
                totalLaborCost = totalLaborCost.add(ledger.getLaborCost());
                totalWorkHourCost = totalWorkHourCost.add(ledger.getWorkHourCost());
                totalSalesRevenue = totalSalesRevenue.add(ledger.getSalesRevenue());
                if (ledger.getProductionQuantity() != null) {
                    totalProductionQuantity = totalProductionQuantity.add(ledger.getProductionQuantity());
                }
                if (ledger.getSalesQuantity() != null) {
                    totalSalesQuantity = totalSalesQuantity.add(ledger.getSalesQuantity());
                }
            }
            
            report.setTotalMaterialCost(totalMaterialCost);
            report.setTotalLaborCost(totalLaborCost);
            report.setTotalWorkHourCost(totalWorkHourCost);
            report.setTotalSalesRevenue(totalSalesRevenue);
            BigDecimal totalCost = totalMaterialCost.add(totalLaborCost).add(totalWorkHourCost);
            report.setTotalProfit(totalSalesRevenue.subtract(totalCost));
            report.setTotalProductionQuantity(totalProductionQuantity);
            report.setTotalSalesQuantity(totalSalesQuantity);
            
            reports.add(report);
        }
        
        return reports;
    }
}