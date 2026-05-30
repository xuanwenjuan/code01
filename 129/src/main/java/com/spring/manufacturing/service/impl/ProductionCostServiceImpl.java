package com.spring.manufacturing.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.spring.manufacturing.entity.ProductionCost;
import com.spring.manufacturing.entity.ProductionWorkOrder;
import com.spring.manufacturing.entity.SpringCategory;
import com.spring.manufacturing.exception.BusinessException;
import com.spring.manufacturing.mapper.ProductionCostMapper;
import com.spring.manufacturing.mapper.ProductionWorkOrderMapper;
import com.spring.manufacturing.mapper.SpringCategoryMapper;
import com.spring.manufacturing.service.ProductionCostService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductionCostServiceImpl extends ServiceImpl<ProductionCostMapper, ProductionCost> implements ProductionCostService {

    private final SpringCategoryMapper springCategoryMapper;
    private final ProductionWorkOrderMapper productionWorkOrderMapper;

    @Override
    public void generateMonthlyReport(String month) {
        YearMonth yearMonth = YearMonth.parse(month, DateTimeFormatter.ofPattern("yyyy-MM"));
        LocalDate startDate = yearMonth.atDay(1);
        LocalDate endDate = yearMonth.atEndOfMonth();

        List<SpringCategory> categories = springCategoryMapper.selectList(null);
        for (SpringCategory category : categories) {
            LambdaQueryWrapper<ProductionWorkOrder> wrapper = new LambdaQueryWrapper<>();
            wrapper.eq(ProductionWorkOrder::getCategoryId, category.getId())
                    .eq(ProductionWorkOrder::getStatus, "FINISHED")
                    .between(ProductionWorkOrder::getActualEndDate, startDate.atStartOfDay(), endDate.atTime(23, 59, 59));
            List<ProductionWorkOrder> workOrders = productionWorkOrderMapper.selectList(wrapper);

            if (!workOrders.isEmpty()) {
                int totalOutput = workOrders.stream().mapToInt(ProductionWorkOrder::getActualQuantity).sum();
                int totalDefective = workOrders.stream().mapToInt(ProductionWorkOrder::getDefectiveQuantity).sum();

                BigDecimal materialCost = BigDecimal.valueOf(totalOutput * 5.5);
                BigDecimal energyCost = BigDecimal.valueOf(totalOutput * 2.3);
                BigDecimal moldCost = BigDecimal.valueOf(totalOutput * 1.2);
                BigDecimal laborCost = BigDecimal.valueOf(totalOutput * 3.8);
                BigDecimal defectiveCost = BigDecimal.valueOf(totalDefective * 10.0);

                BigDecimal totalCost = materialCost.add(energyCost).add(moldCost).add(laborCost).add(defectiveCost);
                BigDecimal unitCost = totalOutput > 0 ? totalCost.divide(BigDecimal.valueOf(totalOutput), 2, RoundingMode.HALF_UP) : BigDecimal.ZERO;

                LambdaQueryWrapper<ProductionCost> existWrapper = new LambdaQueryWrapper<>();
                existWrapper.eq(ProductionCost::getCostMonth, month).eq(ProductionCost::getCategoryId, category.getId());
                ProductionCost existCost = getOne(existWrapper);

                ProductionCost cost = new ProductionCost();
                cost.setCostMonth(month);
                cost.setCategoryId(category.getId());
                cost.setCategoryName(category.getCategoryName());
                cost.setTotalOutput(totalOutput);
                cost.setMaterialCost(materialCost);
                cost.setEnergyCost(energyCost);
                cost.setMoldCost(moldCost);
                cost.setLaborCost(laborCost);
                cost.setDefectiveCost(defectiveCost);
                cost.setTotalCost(totalCost);
                cost.setUnitCost(unitCost);

                if (existCost != null) {
                    cost.setId(existCost.getId());
                    updateById(cost);
                } else {
                    save(cost);
                }
            }
        }
    }

    @Override
    public IPage<ProductionCost> getCostReportPage(int page, int size, String month, Long categoryId) {
        Page<ProductionCost> pageParam = new Page<>(page, size);
        LambdaQueryWrapper<ProductionCost> wrapper = new LambdaQueryWrapper<>();
        if (month != null && !month.isEmpty()) {
            wrapper.eq(ProductionCost::getCostMonth, month);
        }
        if (categoryId != null) {
            wrapper.eq(ProductionCost::getCategoryId, categoryId);
        }
        wrapper.orderByDesc(ProductionCost::getCostMonth);
        return page(pageParam, wrapper);
    }

    @Override
    public List<ProductionCost> getCostSummaryByCategory(String month) {
        return list(new LambdaQueryWrapper<ProductionCost>().eq(ProductionCost::getCostMonth, month));
    }

    @Override
    public void updateCostItem(Long id, String costType, BigDecimal amount) {
        ProductionCost cost = getById(id);
        if (cost == null) {
            throw new BusinessException("成本记录不存在");
        }

        switch (costType) {
            case "material" -> cost.setMaterialCost(amount);
            case "energy" -> cost.setEnergyCost(amount);
            case "mold" -> cost.setMoldCost(amount);
            case "labor" -> cost.setLaborCost(amount);
            case "defective" -> cost.setDefectiveCost(amount);
            default -> throw new BusinessException("不支持的成本类型");
        }

        BigDecimal totalCost = cost.getMaterialCost().add(cost.getEnergyCost())
                .add(cost.getMoldCost()).add(cost.getLaborCost()).add(cost.getDefectiveCost());
        cost.setTotalCost(totalCost);
        if (cost.getTotalOutput() > 0) {
            cost.setUnitCost(totalCost.divide(BigDecimal.valueOf(cost.getTotalOutput()), 2, RoundingMode.HALF_UP));
        }
        updateById(cost);
    }
}