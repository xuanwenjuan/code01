package com.fitness.manufacture.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.core.metadata.OrderItem;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.fitness.manufacture.common.BusinessException;
import com.fitness.manufacture.common.PageQuery;
import com.fitness.manufacture.common.ResultCode;
import com.fitness.manufacture.dto.CostStatisticsQueryDTO;
import com.fitness.manufacture.entity.CostStatistics;
import com.fitness.manufacture.entity.Material;
import com.fitness.manufacture.entity.WorkOrder;
import com.fitness.manufacture.entity.WorkOrderMaterial;
import com.fitness.manufacture.entity.WorkOrderProcess;
import com.fitness.manufacture.mapper.CostStatisticsMapper;
import com.fitness.manufacture.mapper.MaterialMapper;
import com.fitness.manufacture.mapper.WorkOrderMapper;
import com.fitness.manufacture.mapper.WorkOrderMaterialMapper;
import com.fitness.manufacture.mapper.WorkOrderProcessMapper;
import com.fitness.manufacture.service.CostStatisticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CostStatisticsServiceImpl extends ServiceImpl<CostStatisticsMapper, CostStatistics> implements CostStatisticsService {

    private final CostStatisticsMapper costStatisticsMapper;
    private final WorkOrderMapper workOrderMapper;
    private final WorkOrderMaterialMapper workOrderMaterialMapper;
    private final WorkOrderProcessMapper workOrderProcessMapper;
    private final MaterialMapper materialMapper;

    private static final BigDecimal CUTTING_LABOR_COST_PER_HOUR = new BigDecimal("60");
    private static final BigDecimal WELDING_LABOR_COST_PER_HOUR = new BigDecimal("70");
    private static final BigDecimal ASSEMBLY_LABOR_COST_PER_HOUR = new BigDecimal("50");
    private static final BigDecimal GRINDING_LABOR_COST_PER_HOUR = new BigDecimal("45");
    private static final BigDecimal QC_LABOR_COST_PER_HOUR = new BigDecimal("55");

    private static final BigDecimal CUTTING_MACHINE_COST_PER_HOUR = new BigDecimal("40");
    private static final BigDecimal WELDING_MACHINE_COST_PER_HOUR = new BigDecimal("50");
    private static final BigDecimal ASSEMBLY_MACHINE_COST_PER_HOUR = new BigDecimal("25");
    private static final BigDecimal ELECTRICITY_COST_PER_HOUR = new BigDecimal("8");

    private static final BigDecimal WELDING_ROD_COST_RATE = new BigDecimal("0.03");
    private static final BigDecimal WELDING_GAS_COST_RATE = new BigDecimal("0.02");

    private static final String MATERIAL_TYPE_METAL = "METAL";
    private static final String MATERIAL_TYPE_PLASTIC = "PLASTIC";
    private static final String MATERIAL_TYPE_ELECTRONIC = "ELECTRONIC";
    private static final String MATERIAL_TYPE_AUXILIARY = "AUXILIARY";

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void calculateWorkOrderCost(Long workOrderId) {
        WorkOrder workOrder = workOrderMapper.selectById(workOrderId);
        if (workOrder == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }
        if (workOrder.getStatus() != 5) {
            throw new BusinessException(ResultCode.BUSINESS_ERROR, "工单未完成");
        }

        LambdaQueryWrapper<CostStatistics> existWrapper = new LambdaQueryWrapper<>();
        existWrapper.eq(CostStatistics::getWorkOrderId, workOrderId);
        if (costStatisticsMapper.selectCount(existWrapper) > 0) {
            throw new BusinessException(ResultCode.BUSINESS_ERROR, "该工单成本已统计");
        }

        LambdaQueryWrapper<WorkOrderMaterial> materialWrapper = new LambdaQueryWrapper<>();
        materialWrapper.eq(WorkOrderMaterial::getWorkOrderId, workOrderId);
        List<WorkOrderMaterial> materials = workOrderMaterialMapper.selectList(materialWrapper);

        BigDecimal metalMaterialCost = BigDecimal.ZERO;
        BigDecimal plasticMaterialCost = BigDecimal.ZERO;
        BigDecimal electronicMaterialCost = BigDecimal.ZERO;
        BigDecimal auxiliaryMaterialCost = BigDecimal.ZERO;
        BigDecimal materialScrapCost = BigDecimal.ZERO;

        for (WorkOrderMaterial wm : materials) {
            if (wm.getTotalAmount() == null || wm.getMaterialId() == null) {
                continue;
            }
            Material material = materialMapper.selectById(wm.getMaterialId());
            if (material == null) {
                continue;
            }
            String materialType = material.getMaterialType();
            BigDecimal amount = wm.getTotalAmount();

            if (MATERIAL_TYPE_METAL.equalsIgnoreCase(materialType)) {
                metalMaterialCost = metalMaterialCost.add(amount);
            } else if (MATERIAL_TYPE_PLASTIC.equalsIgnoreCase(materialType)) {
                plasticMaterialCost = plasticMaterialCost.add(amount);
            } else if (MATERIAL_TYPE_ELECTRONIC.equalsIgnoreCase(materialType)) {
                electronicMaterialCost = electronicMaterialCost.add(amount);
            } else {
                auxiliaryMaterialCost = auxiliaryMaterialCost.add(amount);
            }

            if (wm.getScrapQuantity() != null && wm.getScrapQuantity().compareTo(BigDecimal.ZERO) > 0) {
                materialScrapCost = materialScrapCost.add(wm.getScrapQuantity().multiply(wm.getUnitPrice() != null ? wm.getUnitPrice() : BigDecimal.ZERO));
            }
        }

        BigDecimal materialCost = metalMaterialCost.add(plasticMaterialCost)
                .add(electronicMaterialCost).add(auxiliaryMaterialCost);

        BigDecimal weldingRodCost = materialCost.multiply(WELDING_ROD_COST_RATE);
        BigDecimal weldingGasCost = materialCost.multiply(WELDING_GAS_COST_RATE);
        BigDecimal weldingCost = weldingRodCost.add(weldingGasCost);

        LambdaQueryWrapper<WorkOrderProcess> processWrapper = new LambdaQueryWrapper<>();
        processWrapper.eq(WorkOrderProcess::getWorkOrderId, workOrderId);
        List<WorkOrderProcess> processes = workOrderProcessMapper.selectList(processWrapper);

        BigDecimal cuttingLaborCost = BigDecimal.ZERO;
        BigDecimal assemblyLaborCost = BigDecimal.ZERO;
        BigDecimal grindingLaborCost = BigDecimal.ZERO;
        BigDecimal qcLaborCost = BigDecimal.ZERO;
        BigDecimal cuttingMachineCost = BigDecimal.ZERO;
        BigDecimal weldingMachineCost = BigDecimal.ZERO;
        BigDecimal assemblyMachineCost = BigDecimal.ZERO;
        BigDecimal totalHours = BigDecimal.ZERO;

        for (WorkOrderProcess process : processes) {
            if (process.getHoursUsed() == null || process.getHoursUsed().compareTo(BigDecimal.ZERO) == 0) {
                continue;
            }
            BigDecimal hours = process.getHoursUsed();
            totalHours = totalHours.add(hours);
            String processCode = process.getProcessCode();

            if ("CUTTING".equalsIgnoreCase(processCode)) {
                cuttingLaborCost = cuttingLaborCost.add(hours.multiply(CUTTING_LABOR_COST_PER_HOUR));
                cuttingMachineCost = cuttingMachineCost.add(hours.multiply(CUTTING_MACHINE_COST_PER_HOUR));
            } else if ("WELDING".equalsIgnoreCase(processCode)) {
                assemblyLaborCost = assemblyLaborCost.add(hours.multiply(WELDING_LABOR_COST_PER_HOUR));
                weldingMachineCost = weldingMachineCost.add(hours.multiply(WELDING_MACHINE_COST_PER_HOUR));
            } else if ("ASSEMBLY".equalsIgnoreCase(processCode)) {
                assemblyLaborCost = assemblyLaborCost.add(hours.multiply(ASSEMBLY_LABOR_COST_PER_HOUR));
                assemblyMachineCost = assemblyMachineCost.add(hours.multiply(ASSEMBLY_MACHINE_COST_PER_HOUR));
            } else if ("GRINDING".equalsIgnoreCase(processCode)) {
                grindingLaborCost = grindingLaborCost.add(hours.multiply(GRINDING_LABOR_COST_PER_HOUR));
                assemblyMachineCost = assemblyMachineCost.add(hours.multiply(ASSEMBLY_MACHINE_COST_PER_HOUR));
            } else if ("QC".equalsIgnoreCase(processCode)) {
                qcLaborCost = qcLaborCost.add(hours.multiply(QC_LABOR_COST_PER_HOUR));
            } else {
                assemblyLaborCost = assemblyLaborCost.add(hours.multiply(ASSEMBLY_LABOR_COST_PER_HOUR));
                assemblyMachineCost = assemblyMachineCost.add(hours.multiply(ASSEMBLY_MACHINE_COST_PER_HOUR));
            }
        }

        BigDecimal laborCost = cuttingLaborCost.add(assemblyLaborCost)
                .add(grindingLaborCost).add(qcLaborCost);
        BigDecimal electricityCost = totalHours.multiply(ELECTRICITY_COST_PER_HOUR);
        BigDecimal equipmentCost = cuttingMachineCost.add(weldingMachineCost)
                .add(assemblyMachineCost).add(electricityCost);

        Integer scrapQuantity = workOrder.getActualQuantity() != null ? workOrder.getActualQuantity() - workOrder.getActualQuantity() : 0;
        Integer qualifiedQuantity = workOrder.getActualQuantity() != null ? workOrder.getActualQuantity() : 0;
        Integer planQuantity = workOrder.getPlanQuantity() != null ? workOrder.getPlanQuantity() : 0;

        BigDecimal passRate = planQuantity > 0
                ? new BigDecimal(qualifiedQuantity).divide(new BigDecimal(planQuantity), 4, RoundingMode.HALF_UP)
                : BigDecimal.ONE;

        BigDecimal reworkCost = materialCost.multiply(new BigDecimal("0.02"));
        BigDecimal scrapCost = materialScrapCost.add(reworkCost);

        BigDecimal totalCost = materialCost.add(weldingCost).add(laborCost)
                .add(equipmentCost).add(scrapCost);

        BigDecimal unitCost = qualifiedQuantity > 0
                ? totalCost.divide(new BigDecimal(qualifiedQuantity), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        CostStatistics statistics = new CostStatistics();
        statistics.setWorkOrderId(workOrderId);
        statistics.setWorkOrderNo(workOrder.getWorkOrderNo());
        statistics.setProductId(workOrder.getProductId());
        statistics.setProductName(workOrder.getProductName());

        statistics.setMetalMaterialCost(metalMaterialCost);
        statistics.setPlasticMaterialCost(plasticMaterialCost);
        statistics.setElectronicMaterialCost(electronicMaterialCost);
        statistics.setAuxiliaryMaterialCost(auxiliaryMaterialCost);
        statistics.setMaterialCost(materialCost);

        statistics.setWeldingRodCost(weldingRodCost);
        statistics.setWeldingGasCost(weldingGasCost);
        statistics.setWeldingCost(weldingCost);

        statistics.setCuttingLaborCost(cuttingLaborCost);
        statistics.setAssemblyLaborCost(assemblyLaborCost);
        statistics.setGrindingLaborCost(grindingLaborCost);
        statistics.setQcLaborCost(qcLaborCost);
        statistics.setLaborCost(laborCost);

        statistics.setCuttingMachineCost(cuttingMachineCost);
        statistics.setWeldingMachineCost(weldingMachineCost);
        statistics.setAssemblyMachineCost(assemblyMachineCost);
        statistics.setElectricityCost(electricityCost);
        statistics.setEquipmentCost(equipmentCost);

        statistics.setMaterialScrapCost(materialScrapCost);
        statistics.setReworkCost(reworkCost);
        statistics.setScrapCost(scrapCost);

        statistics.setTotalCost(totalCost);
        statistics.setUnitCost(unitCost);

        statistics.setPlanQuantity(planQuantity);
        statistics.setActualQuantity(workOrder.getActualQuantity());
        statistics.setScrapQuantity(scrapQuantity);
        statistics.setQualifiedQuantity(qualifiedQuantity);
        statistics.setPassRate(passRate);

        statistics.setStartDate(workOrder.getActualStartTime() != null ? workOrder.getActualStartTime().toLocalDate() : null);
        statistics.setEndDate(workOrder.getActualEndTime() != null ? workOrder.getActualEndTime().toLocalDate() : null);
        statistics.setStatisticsDate(LocalDate.now());
        costStatisticsMapper.insert(statistics);
    }

    @Override
    public IPage<CostStatistics> getCostStatisticsPage(PageQuery query, LocalDate startDate, LocalDate endDate, Long productId) {
        LambdaQueryWrapper<CostStatistics> wrapper = new LambdaQueryWrapper<>();
        if (startDate != null) {
            wrapper.ge(CostStatistics::getStatisticsDate, startDate);
        }
        if (endDate != null) {
            wrapper.le(CostStatistics::getStatisticsDate, endDate);
        }
        if (productId != null) {
            wrapper.eq(CostStatistics::getProductId, productId);
        }
        wrapper.orderByDesc(CostStatistics::getStatisticsDate);

        Page<CostStatistics> page = new Page<>(query.getPageNum(), query.getPageSize());
        return costStatisticsMapper.selectPage(page, wrapper);
    }

    @Override
    public IPage<CostStatistics> getCostStatisticsPageByConditions(CostStatisticsQueryDTO queryDTO) {
        LambdaQueryWrapper<CostStatistics> wrapper = new LambdaQueryWrapper<>();

        if (StringUtils.hasText(queryDTO.getKeyword())) {
            wrapper.and(w -> w.like(CostStatistics::getProductName, queryDTO.getKeyword())
                    .or().like(CostStatistics::getWorkOrderNo, queryDTO.getKeyword()));
        }
        if (StringUtils.hasText(queryDTO.getWorkOrderNo())) {
            wrapper.like(CostStatistics::getWorkOrderNo, queryDTO.getWorkOrderNo());
        }
        if (queryDTO.getProductId() != null) {
            wrapper.eq(CostStatistics::getProductId, queryDTO.getProductId());
        }
        if (queryDTO.getCategoryId() != null) {
            wrapper.eq(CostStatistics::getCategoryId, queryDTO.getCategoryId());
        }
        if (queryDTO.getStartDate() != null) {
            wrapper.ge(CostStatistics::getStatisticsDate, queryDTO.getStartDate());
        }
        if (queryDTO.getEndDate() != null) {
            wrapper.le(CostStatistics::getStatisticsDate, queryDTO.getEndDate());
        }
        if (queryDTO.getMinTotalCost() != null) {
            wrapper.ge(CostStatistics::getTotalCost, queryDTO.getMinTotalCost());
        }
        if (queryDTO.getMaxTotalCost() != null) {
            wrapper.le(CostStatistics::getTotalCost, queryDTO.getMaxTotalCost());
        }
        if (queryDTO.getMinUnitCost() != null) {
            wrapper.ge(CostStatistics::getUnitCost, queryDTO.getMinUnitCost());
        }
        if (queryDTO.getMaxUnitCost() != null) {
            wrapper.le(CostStatistics::getUnitCost, queryDTO.getMaxUnitCost());
        }
        if (queryDTO.getMinQuantity() != null) {
            wrapper.ge(CostStatistics::getQualifiedQuantity, queryDTO.getMinQuantity());
        }
        if (queryDTO.getMaxQuantity() != null) {
            wrapper.le(CostStatistics::getQualifiedQuantity, queryDTO.getMaxQuantity());
        }

        Page<CostStatistics> page = new Page<>(queryDTO.getPageNum(), queryDTO.getPageSize());

        if (StringUtils.hasText(queryDTO.getOrderBy())) {
            boolean isAsc = "asc".equalsIgnoreCase(queryDTO.getOrderDirection());
            switch (queryDTO.getOrderBy()) {
                case "totalCost" ->
                        page.addOrder(isAsc ? OrderItem.asc("total_cost") : OrderItem.desc("total_cost"));
                case "unitCost" ->
                        page.addOrder(isAsc ? OrderItem.asc("unit_cost") : OrderItem.desc("unit_cost"));
                case "qualifiedQuantity" ->
                        page.addOrder(isAsc ? OrderItem.asc("qualified_quantity") : OrderItem.desc("qualified_quantity"));
                case "passRate" ->
                        page.addOrder(isAsc ? OrderItem.asc("pass_rate") : OrderItem.desc("pass_rate"));
                case "statisticsDate" ->
                        page.addOrder(isAsc ? OrderItem.asc("statistics_date") : OrderItem.desc("statistics_date"));
                default -> page.addOrder(OrderItem.desc("statistics_date"));
            }
        } else {
            page.addOrder(OrderItem.desc("statistics_date"));
        }

        return costStatisticsMapper.selectPage(page, wrapper);
    }

    @Override
    public List<CostStatistics> getCostStatisticsList(LocalDate startDate, LocalDate endDate, Long productId) {
        LambdaQueryWrapper<CostStatistics> wrapper = new LambdaQueryWrapper<>();
        if (startDate != null) {
            wrapper.ge(CostStatistics::getStatisticsDate, startDate);
        }
        if (endDate != null) {
            wrapper.le(CostStatistics::getStatisticsDate, endDate);
        }
        if (productId != null) {
            wrapper.eq(CostStatistics::getProductId, productId);
        }
        wrapper.orderByDesc(CostStatistics::getStatisticsDate);
        return costStatisticsMapper.selectList(wrapper);
    }
}
