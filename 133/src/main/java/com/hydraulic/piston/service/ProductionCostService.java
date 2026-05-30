package com.hydraulic.piston.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.hydraulic.piston.dto.ProductionCostDTO;
import com.hydraulic.piston.entity.ProductionCost;
import com.hydraulic.piston.entity.ProductionOrder;
import com.hydraulic.piston.exception.BusinessException;
import com.hydraulic.piston.mapper.ProductionCostMapper;
import com.hydraulic.piston.mapper.ProductionOrderMapper;
import com.hydraulic.piston.vo.MonthlyCostReportVO;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductionCostService {

    private final ProductionCostMapper costMapper;
    private final ProductionOrderMapper orderMapper;

    public Page<ProductionCost> getPage(Integer pageNum, Integer pageSize, String pistonModel, Integer reportYear, Integer reportMonth) {
        Page<ProductionCost> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<ProductionCost> wrapper = new LambdaQueryWrapper<>();

        if (pistonModel != null && !pistonModel.isEmpty()) {
            wrapper.like(ProductionCost::getPistonModel, pistonModel);
        }
        if (reportYear != null) {
            wrapper.eq(ProductionCost::getReportYear, reportYear);
        }
        if (reportMonth != null) {
            wrapper.eq(ProductionCost::getReportMonth, reportMonth);
        }
        wrapper.orderByDesc(ProductionCost::getCreateTime);

        return costMapper.selectPage(page, wrapper);
    }

    public ProductionCost getById(Long id) {
        ProductionCost cost = costMapper.selectById(id);
        if (cost == null) {
            throw new BusinessException("成本记录不存在");
        }
        return cost;
    }

    public ProductionCost getByOrderId(Long orderId) {
        return costMapper.selectOne(
                new LambdaQueryWrapper<ProductionCost>()
                        .eq(ProductionCost::getOrderId, orderId)
        );
    }

    @Transactional(rollbackFor = Exception.class)
    public void create(ProductionCostDTO dto) {
        ProductionOrder order = orderMapper.selectById(dto.getOrderId());
        if (order == null) {
            throw new BusinessException("工单不存在");
        }

        ProductionCost exist = getByOrderId(dto.getOrderId());
        if (exist != null) {
            throw new BusinessException("该工单已存在成本记录");
        }

        ProductionCost cost = new ProductionCost();
        BeanUtils.copyProperties(dto, cost);

        cost.setOrderNo(order.getOrderNo());
        cost.setPistonModel(order.getPistonModel());
        cost.setQuantity(order.getQuantity());

        calculateTotalCost(cost);

        LocalDateTime now = LocalDateTime.now();
        cost.setReportYear(now.getYear());
        cost.setReportMonth(now.getMonthValue());

        costMapper.insert(cost);
    }

    @Transactional(rollbackFor = Exception.class)
    public void update(ProductionCostDTO dto) {
        ProductionCost exist = costMapper.selectById(dto.getId());
        if (exist == null) {
            throw new BusinessException("成本记录不存在");
        }

        ProductionCost cost = new ProductionCost();
        BeanUtils.copyProperties(dto, cost);

        if (exist.getQuantity() != null) {
            cost.setQuantity(exist.getQuantity());
        }

        calculateTotalCost(cost);

        costMapper.updateById(cost);
    }

    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        costMapper.deleteById(id);
    }

    public MonthlyCostReportVO generateMonthlyReport(Integer year, Integer month) {
        List<ProductionCost> costList = costMapper.selectList(
                new LambdaQueryWrapper<ProductionCost>()
                        .eq(ProductionCost::getReportYear, year)
                        .eq(ProductionCost::getReportMonth, month)
        );

        MonthlyCostReportVO report = new MonthlyCostReportVO();
        report.setReportYear(year);
        report.setReportMonth(month);
        report.setTotalOrders(costList.size());

        int totalQuantity = 0;
        BigDecimal totalMaterialCost = BigDecimal.ZERO;
        BigDecimal totalToolCost = BigDecimal.ZERO;
        BigDecimal totalEnergyCost = BigDecimal.ZERO;
        BigDecimal totalLaborCost = BigDecimal.ZERO;
        BigDecimal totalScrapCost = BigDecimal.ZERO;
        BigDecimal totalCost = BigDecimal.ZERO;

        for (ProductionCost cost : costList) {
            totalQuantity += cost.getQuantity() != null ? cost.getQuantity() : 0;
            totalMaterialCost = totalMaterialCost.add(cost.getMaterialCost() != null ? cost.getMaterialCost() : BigDecimal.ZERO);
            totalToolCost = totalToolCost.add(cost.getToolCost() != null ? cost.getToolCost() : BigDecimal.ZERO);
            totalEnergyCost = totalEnergyCost.add(cost.getEnergyCost() != null ? cost.getEnergyCost() : BigDecimal.ZERO);
            totalLaborCost = totalLaborCost.add(cost.getLaborCost() != null ? cost.getLaborCost() : BigDecimal.ZERO);
            totalScrapCost = totalScrapCost.add(cost.getScrapCost() != null ? cost.getScrapCost() : BigDecimal.ZERO);
            totalCost = totalCost.add(cost.getTotalCost() != null ? cost.getTotalCost() : BigDecimal.ZERO);
        }

        report.setTotalQuantity(totalQuantity);
        report.setTotalMaterialCost(totalMaterialCost);
        report.setTotalToolCost(totalToolCost);
        report.setTotalEnergyCost(totalEnergyCost);
        report.setTotalLaborCost(totalLaborCost);
        report.setTotalScrapCost(totalScrapCost);
        report.setTotalCost(totalCost);

        if (totalQuantity > 0) {
            report.setAvgUnitCost(totalCost.divide(BigDecimal.valueOf(totalQuantity), 2, RoundingMode.HALF_UP));
            report.setAvgMaterialCostPerUnit(totalMaterialCost.divide(BigDecimal.valueOf(totalQuantity), 2, RoundingMode.HALF_UP));
            report.setAvgToolCostPerUnit(totalToolCost.divide(BigDecimal.valueOf(totalQuantity), 2, RoundingMode.HALF_UP));
            report.setAvgEnergyCostPerUnit(totalEnergyCost.divide(BigDecimal.valueOf(totalQuantity), 2, RoundingMode.HALF_UP));
            report.setAvgLaborCostPerUnit(totalLaborCost.divide(BigDecimal.valueOf(totalQuantity), 2, RoundingMode.HALF_UP));
        } else {
            report.setAvgUnitCost(BigDecimal.ZERO);
            report.setAvgMaterialCostPerUnit(BigDecimal.ZERO);
            report.setAvgToolCostPerUnit(BigDecimal.ZERO);
            report.setAvgEnergyCostPerUnit(BigDecimal.ZERO);
            report.setAvgLaborCostPerUnit(BigDecimal.ZERO);
        }

        return report;
    }

    private void calculateTotalCost(ProductionCost cost) {
        BigDecimal materialCost = cost.getMaterialCost() != null ? cost.getMaterialCost() : BigDecimal.ZERO;
        BigDecimal toolCost = cost.getToolCost() != null ? cost.getToolCost() : BigDecimal.ZERO;
        BigDecimal energyCost = cost.getEnergyCost() != null ? cost.getEnergyCost() : BigDecimal.ZERO;
        BigDecimal laborCost = cost.getLaborCost() != null ? cost.getLaborCost() : BigDecimal.ZERO;
        BigDecimal scrapCost = cost.getScrapCost() != null ? cost.getScrapCost() : BigDecimal.ZERO;

        BigDecimal total = materialCost.add(toolCost).add(energyCost).add(laborCost).add(scrapCost);
        cost.setTotalCost(total);

        if (cost.getQuantity() != null && cost.getQuantity() > 0) {
            cost.setUnitCost(total.divide(BigDecimal.valueOf(cost.getQuantity()), 2, RoundingMode.HALF_UP));
        }
    }
}
