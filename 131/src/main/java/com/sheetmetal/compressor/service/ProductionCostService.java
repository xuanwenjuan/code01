package com.sheetmetal.compressor.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.sheetmetal.compressor.dto.ProductionCostDTO;
import com.sheetmetal.compressor.entity.ProductionCost;
import com.sheetmetal.compressor.exception.BusinessException;
import com.sheetmetal.compressor.mapper.ProductionCostMapper;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class ProductionCostService {

    @Autowired
    private ProductionCostMapper costMapper;

    public List<ProductionCost> list(String quarter, Long categoryId) {
        LambdaQueryWrapper<ProductionCost> wrapper = new LambdaQueryWrapper<>();
        if (quarter != null && !quarter.isEmpty()) {
            wrapper.eq(ProductionCost::getQuarter, quarter);
        }
        if (categoryId != null) {
            wrapper.eq(ProductionCost::getCategoryId, categoryId);
        }
        wrapper.orderByDesc(ProductionCost::getCostDate);
        return costMapper.selectList(wrapper);
    }

    public ProductionCost getById(Long id) {
        return costMapper.selectById(id);
    }

    @Transactional(rollbackFor = Exception.class)
    public void create(ProductionCostDTO dto) {
        String costNo = "COST" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));

        ProductionCost cost = new ProductionCost();
        BeanUtils.copyProperties(dto, cost);
        cost.setCostNo(costNo);

        if (cost.getCostDate() == null) {
            cost.setCostDate(LocalDate.now());
        }

        if (cost.getQuarter() == null || cost.getQuarter().isEmpty()) {
            cost.setQuarter(getQuarter(cost.getCostDate()));
        }

        calculateTotalCost(cost);
        costMapper.insert(cost);
    }

    @Transactional(rollbackFor = Exception.class)
    public void update(ProductionCostDTO dto) {
        ProductionCost existing = costMapper.selectById(dto.getId());
        if (existing == null) {
            throw new BusinessException("成本记录不存在");
        }

        ProductionCost cost = new ProductionCost();
        BeanUtils.copyProperties(dto, cost);

        if (cost.getCostDate() != null && (cost.getQuarter() == null || cost.getQuarter().isEmpty())) {
            cost.setQuarter(getQuarter(cost.getCostDate()));
        }

        calculateTotalCost(cost);
        costMapper.updateById(cost);
    }

    private void calculateTotalCost(ProductionCost cost) {
        BigDecimal total = BigDecimal.ZERO;

        if (cost.getMaterialCost() != null) {
            total = total.add(cost.getMaterialCost());
        }
        if (cost.getEquipmentCost() != null) {
            total = total.add(cost.getEquipmentCost());
        }
        if (cost.getSprayCost() != null) {
            total = total.add(cost.getSprayCost());
        }
        if (cost.getLaborCost() != null) {
            total = total.add(cost.getLaborCost());
        }
        if (cost.getDefectiveCost() != null) {
            total = total.add(cost.getDefectiveCost());
        }
        if (cost.getOtherCost() != null) {
            total = total.add(cost.getOtherCost());
        }

        cost.setTotalCost(total);

        if (cost.getProductionQuantity() != null && cost.getProductionQuantity() > 0) {
            cost.setUnitCost(total.divide(BigDecimal.valueOf(cost.getProductionQuantity()), 2, RoundingMode.HALF_UP));
        } else {
            cost.setUnitCost(BigDecimal.ZERO);
        }
    }

    private String getQuarter(LocalDate date) {
        int year = date.getYear();
        int month = date.getMonthValue();
        int quarter = (month - 1) / 3 + 1;
        return year + "Q" + quarter;
    }

    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        costMapper.deleteById(id);
    }

    public BigDecimal getQuarterTotalCost(String quarter) {
        List<ProductionCost> costs = list(quarter, null);
        return costs.stream()
            .map(cost -> cost.getTotalCost() != null ? cost.getTotalCost() : BigDecimal.ZERO)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public BigDecimal getCategoryTotalCost(Long categoryId) {
        List<ProductionCost> costs = list(null, categoryId);
        return costs.stream()
            .map(cost -> cost.getTotalCost() != null ? cost.getTotalCost() : BigDecimal.ZERO)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
