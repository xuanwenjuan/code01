package com.radiator.management.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.radiator.management.entity.ProductionCost;
import com.radiator.management.entity.ProductionReport;
import com.radiator.management.entity.ProductionWorkOrder;
import com.radiator.management.exception.BusinessException;
import com.radiator.management.mapper.ProductionCostMapper;
import com.radiator.management.mapper.ProductionReportMapper;
import com.radiator.management.mapper.ProductionWorkOrderMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductionReportService {

    private final ProductionReportMapper reportMapper;
    private final ProductionWorkOrderMapper workOrderMapper;
    private final ProductionCostMapper costMapper;

    @Transactional(rollbackFor = Exception.class)
    public void createReport(ProductionReport report, Long userId) {
        ProductionWorkOrder workOrder = workOrderMapper.selectById(report.getWorkOrderId());
        if (workOrder == null) {
            throw new BusinessException("工单不存在");
        }

        if (report.getReportQuantity() < report.getQualifiedQuantity() + report.getDefectiveQuantity()) {
            throw new BusinessException("报工数量不能小于合格数量加不良数量");
        }

        report.setCreateBy(userId);
        reportMapper.insert(report);

        recordCost(report);
    }

    private void recordCost(ProductionReport report) {
        String month = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM"));

        LambdaQueryWrapper<ProductionCost> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ProductionCost::getWorkOrderId, report.getWorkOrderId())
                .eq(ProductionCost::getMonth, month);
        ProductionCost cost = costMapper.selectOne(wrapper);

        if (cost == null) {
            cost = new ProductionCost();
            cost.setWorkOrderId(report.getWorkOrderId());
            cost.setMonth(month);
            cost.setLaborCost(report.getLaborCost() != null ? report.getLaborCost() : BigDecimal.ZERO);
            cost.setEquipmentCost(report.getEquipmentCost() != null ? report.getEquipmentCost() : BigDecimal.ZERO);
            cost.setScrapCost(BigDecimal.ZERO);
            cost.setMaterialCost(BigDecimal.ZERO);
            cost.setConsumableCost(BigDecimal.ZERO);
            cost.setTotalCost(cost.getLaborCost().add(cost.getEquipmentCost()));
            costMapper.insert(cost);
        } else {
            cost.setLaborCost(cost.getLaborCost().add(report.getLaborCost() != null ? report.getLaborCost() : BigDecimal.ZERO));
            cost.setEquipmentCost(cost.getEquipmentCost().add(report.getEquipmentCost() != null ? report.getEquipmentCost() : BigDecimal.ZERO));
            cost.setTotalCost(cost.getMaterialCost().add(cost.getLaborCost())
                    .add(cost.getEquipmentCost()).add(cost.getConsumableCost()).add(cost.getScrapCost()));
            costMapper.updateById(cost);
        }
    }

    public Page<ProductionReport> listReports(int page, int size, Long workOrderId, String processCode) {
        LambdaQueryWrapper<ProductionReport> wrapper = new LambdaQueryWrapper<>();
        if (workOrderId != null) {
            wrapper.eq(ProductionReport::getWorkOrderId, workOrderId);
        }
        if (processCode != null && !processCode.isEmpty()) {
            wrapper.eq(ProductionReport::getProcessCode, processCode);
        }
        wrapper.orderByDesc(ProductionReport::getCreateTime);
        return reportMapper.selectPage(new Page<>(page, size), wrapper);
    }

    public ProductionReport getReportById(Long id) {
        return reportMapper.selectById(id);
    }

    public List<ProductionReport> getReportsByWorkOrder(Long workOrderId) {
        return reportMapper.selectList(
                new LambdaQueryWrapper<ProductionReport>()
                        .eq(ProductionReport::getWorkOrderId, workOrderId)
                        .orderByDesc(ProductionReport::getCreateTime)
        );
    }
}
