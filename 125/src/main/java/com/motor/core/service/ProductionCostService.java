package com.motor.core.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.motor.core.dto.ProductionCostDTO;
import com.motor.core.entity.OrderMaterialDetail;
import com.motor.core.entity.ProductionCost;
import com.motor.core.exception.BusinessException;
import com.motor.core.mapper.OrderMaterialDetailMapper;
import com.motor.core.mapper.ProductionCostMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductionCostService extends ServiceImpl<ProductionCostMapper, ProductionCost> {
    private final OrderMaterialDetailMapper orderMaterialDetailMapper;

    public Page<ProductionCost> getPage(int pageNum, int pageSize, Long categoryId, LocalDate startDate, LocalDate endDate) {
        LambdaQueryWrapper<ProductionCost> wrapper = new LambdaQueryWrapper<>();
        if (categoryId != null) {
            wrapper.eq(ProductionCost::getCategoryId, categoryId);
        }
        if (startDate != null) {
            wrapper.ge(ProductionCost::getCostDate, startDate);
        }
        if (endDate != null) {
            wrapper.le(ProductionCost::getCostDate, endDate);
        }
        wrapper.orderByDesc(ProductionCost::getCostDate);
        return page(new Page<>(pageNum, pageSize), wrapper);
    }

    @Transactional
    public ProductionCost create(ProductionCostDTO dto) {
        ProductionCost cost = new ProductionCost();
        cost.setCostDate(dto.getCostDate());
        cost.setCategoryId(dto.getCategoryId());
        cost.setOrderId(dto.getOrderId());
        cost.setMaterialCost(dto.getMaterialCost());
        cost.setMaterialWaste(dto.getMaterialWaste());
        cost.setEnergyCost(dto.getEnergyCost());
        cost.setEnergyConsumption(dto.getEnergyConsumption());
        cost.setLaborCost(dto.getLaborCost());
        cost.setLaborHours(dto.getLaborHours());
        cost.setDefectiveCost(dto.getDefectiveCost());
        cost.setDefectiveQuantity(dto.getDefectiveQuantity());
        cost.setProductionQuantity(dto.getProductionQuantity());
        cost.setSalePrice(dto.getSalePrice());
        cost.setRemark(dto.getRemark());
        cost.setCreateTime(LocalDateTime.now());
        
        calculateTotalCost(cost);
        save(cost);
        return cost;
    }

    @Transactional
    public boolean update(Long id, ProductionCostDTO dto) {
        ProductionCost cost = getById(id);
        if (cost == null) {
            throw new BusinessException("成本记录不存在");
        }
        
        cost.setCostDate(dto.getCostDate());
        cost.setCategoryId(dto.getCategoryId());
        cost.setOrderId(dto.getOrderId());
        cost.setMaterialCost(dto.getMaterialCost());
        cost.setMaterialWaste(dto.getMaterialWaste());
        cost.setEnergyCost(dto.getEnergyCost());
        cost.setEnergyConsumption(dto.getEnergyConsumption());
        cost.setLaborCost(dto.getLaborCost());
        cost.setLaborHours(dto.getLaborHours());
        cost.setDefectiveCost(dto.getDefectiveCost());
        cost.setDefectiveQuantity(dto.getDefectiveQuantity());
        cost.setProductionQuantity(dto.getProductionQuantity());
        cost.setSalePrice(dto.getSalePrice());
        cost.setRemark(dto.getRemark());
        cost.setUpdateTime(LocalDateTime.now());
        
        calculateTotalCost(cost);
        return updateById(cost);
    }

    private void calculateTotalCost(ProductionCost cost) {
        BigDecimal total = BigDecimal.ZERO;
        if (cost.getMaterialCost() != null) {
            total = total.add(cost.getMaterialCost());
        }
        if (cost.getEnergyCost() != null) {
            total = total.add(cost.getEnergyCost());
        }
        if (cost.getLaborCost() != null) {
            total = total.add(cost.getLaborCost());
        }
        if (cost.getDefectiveCost() != null) {
            total = total.add(cost.getDefectiveCost());
        }
        cost.setTotalCost(total);

        if (cost.getProductionQuantity() != null && cost.getProductionQuantity() > 0) {
            cost.setUnitCost(total.divide(new BigDecimal(cost.getProductionQuantity()), 2, BigDecimal.ROUND_HALF_UP));
        }

        if (cost.getSalePrice() != null && cost.getProductionQuantity() != null) {
            BigDecimal revenue = cost.getSalePrice().multiply(new BigDecimal(cost.getProductionQuantity()));
            cost.setProfit(revenue.subtract(total));
        }
    }

    public List<OrderMaterialDetail> getOrderMaterialDetails(Long orderId) {
        LambdaQueryWrapper<OrderMaterialDetail> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(OrderMaterialDetail::getOrderId, orderId);
        return orderMaterialDetailMapper.selectList(wrapper);
    }

    @Transactional
    public boolean addMaterialDetail(OrderMaterialDetail detail) {
        detail.setCreateTime(LocalDateTime.now());
        if (detail.getUnitPrice() != null && detail.getUsageQuantity() != null) {
            detail.setTotalPrice(detail.getUnitPrice().multiply(detail.getUsageQuantity()));
        }
        return orderMaterialDetailMapper.insert(detail) > 0;
    }

    public ProductionCost generateReport(Long categoryId, LocalDate startDate, LocalDate endDate) {
        LambdaQueryWrapper<ProductionCost> wrapper = new LambdaQueryWrapper<>();
        if (categoryId != null) {
            wrapper.eq(ProductionCost::getCategoryId, categoryId);
        }
        if (startDate != null) {
            wrapper.ge(ProductionCost::getCostDate, startDate);
        }
        if (endDate != null) {
            wrapper.le(ProductionCost::getCostDate, endDate);
        }

        List<ProductionCost> costs = list(wrapper);

        ProductionCost summary = new ProductionCost();
        summary.setMaterialCost(BigDecimal.ZERO);
        summary.setMaterialWaste(BigDecimal.ZERO);
        summary.setEnergyCost(BigDecimal.ZERO);
        summary.setEnergyConsumption(BigDecimal.ZERO);
        summary.setLaborCost(BigDecimal.ZERO);
        summary.setLaborHours(BigDecimal.ZERO);
        summary.setDefectiveCost(BigDecimal.ZERO);
        summary.setDefectiveQuantity(0);
        summary.setTotalCost(BigDecimal.ZERO);
        summary.setProductionQuantity(0);
        summary.setProfit(BigDecimal.ZERO);

        for (ProductionCost cost : costs) {
            if (cost.getMaterialCost() != null) {
                summary.setMaterialCost(summary.getMaterialCost().add(cost.getMaterialCost()));
            }
            if (cost.getMaterialWaste() != null) {
                summary.setMaterialWaste(summary.getMaterialWaste().add(cost.getMaterialWaste()));
            }
            if (cost.getEnergyCost() != null) {
                summary.setEnergyCost(summary.getEnergyCost().add(cost.getEnergyCost()));
            }
            if (cost.getEnergyConsumption() != null) {
                summary.setEnergyConsumption(summary.getEnergyConsumption().add(cost.getEnergyConsumption()));
            }
            if (cost.getLaborCost() != null) {
                summary.setLaborCost(summary.getLaborCost().add(cost.getLaborCost()));
            }
            if (cost.getLaborHours() != null) {
                summary.setLaborHours(summary.getLaborHours().add(cost.getLaborHours()));
            }
            if (cost.getDefectiveCost() != null) {
                summary.setDefectiveCost(summary.getDefectiveCost().add(cost.getDefectiveCost()));
            }
            if (cost.getDefectiveQuantity() != null) {
                summary.setDefectiveQuantity(summary.getDefectiveQuantity() + cost.getDefectiveQuantity());
            }
            if (cost.getTotalCost() != null) {
                summary.setTotalCost(summary.getTotalCost().add(cost.getTotalCost()));
            }
            if (cost.getProductionQuantity() != null) {
                summary.setProductionQuantity(summary.getProductionQuantity() + cost.getProductionQuantity());
            }
            if (cost.getProfit() != null) {
                summary.setProfit(summary.getProfit().add(cost.getProfit()));
            }
        }

        return summary;
    }
}
