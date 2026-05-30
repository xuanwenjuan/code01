package com.snack.processing.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.snack.processing.common.Result;
import com.snack.processing.common.enums.WorkOrderStatusEnum;
import com.snack.processing.dto.statistics.StatisticsQueryDTO;
import com.snack.processing.entity.ProductionStatistics;
import com.snack.processing.entity.QualityInspection;
import com.snack.processing.entity.WorkOrder;
import com.snack.processing.entity.WorkOrderMaterial;
import com.snack.processing.entity.WorkOrderProcess;
import com.snack.processing.mapper.ProductionStatisticsMapper;
import com.snack.processing.mapper.QualityInspectionMapper;
import com.snack.processing.mapper.WorkOrderMapper;
import com.snack.processing.mapper.WorkOrderMaterialMapper;
import com.snack.processing.mapper.WorkOrderProcessMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class StatisticsService extends ServiceImpl<ProductionStatisticsMapper, ProductionStatistics> {

    private final ProductionStatisticsMapper statisticsMapper;
    private final WorkOrderMapper workOrderMapper;
    private final WorkOrderProcessMapper processMapper;
    private final WorkOrderMaterialMapper materialMapper;

    @Transactional(rollbackFor = Exception.class)
    public Result<ProductionStatistics> generateDailyStatistics(LocalDate date) {
        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.atTime(23, 59, 59);

        ProductionStatistics statistics = new ProductionStatistics();
        statistics.setStatisticsDate(date);
        statistics.setStatisticsType(1);

        List<WorkOrder> workOrders = workOrderMapper.selectList(new LambdaQueryWrapper<WorkOrder>()
                .ge(WorkOrder::getCreateTime, startOfDay)
                .le(WorkOrder::getCreateTime, endOfDay));

        statistics.setWorkOrderCount(workOrders.size());

        List<WorkOrder> completedOrders = workOrders.stream()
                .filter(o -> WorkOrderStatusEnum.COMPLETED.getCode().equals(o.getStatus()))
                .toList();
        statistics.setCompletedOrderCount(completedOrders.size());

        BigDecimal totalOutput = BigDecimal.ZERO;
        BigDecimal totalDefective = BigDecimal.ZERO;
        BigDecimal totalMaterialCost = BigDecimal.ZERO;
        BigDecimal totalEnergyCost = BigDecimal.ZERO;
        BigDecimal totalLaborCost = BigDecimal.ZERO;
        BigDecimal totalPackagingCost = BigDecimal.ZERO;
        BigDecimal totalLaborHours = BigDecimal.ZERO;
        BigDecimal totalEnergyConsumption = BigDecimal.ZERO;
        BigDecimal totalMaterialWasteCost = BigDecimal.ZERO;
        BigDecimal totalProcessWasteCost = BigDecimal.ZERO;
        BigDecimal totalPlanQuantity = BigDecimal.ZERO;
        BigDecimal totalActualMaterialUsed = BigDecimal.ZERO;

        for (WorkOrder order : completedOrders) {
            if (order.getActualQuantity() != null) {
                totalOutput = totalOutput.add(order.getActualQuantity());
            }
            if (order.getPlanQuantity() != null) {
                totalPlanQuantity = totalPlanQuantity.add(order.getPlanQuantity());
            }

            List<WorkOrderProcess> processes = processMapper.selectList(new LambdaQueryWrapper<WorkOrderProcess>()
                    .eq(WorkOrderProcess::getWorkOrderId, order.getId()));

            for (WorkOrderProcess process : processes) {
                if (process.getDefectiveQuantity() != null) {
                    totalDefective = totalDefective.add(process.getDefectiveQuantity());
                }
                if (process.getLaborHours() != null) {
                    totalLaborHours = totalLaborHours.add(process.getLaborHours());
                    totalLaborCost = totalLaborCost.add(process.getLaborHours().multiply(new BigDecimal("50")));
                }
                if (process.getEnergyConsumption() != null) {
                    totalEnergyConsumption = totalEnergyConsumption.add(process.getEnergyConsumption());
                    totalEnergyCost = totalEnergyCost.add(process.getEnergyConsumption().multiply(new BigDecimal("1.5")));
                }
            }

            List<WorkOrderMaterial> materials = materialMapper.selectList(new LambdaQueryWrapper<WorkOrderMaterial>()
                    .eq(WorkOrderMaterial::getWorkOrderId, order.getId()));

            for (WorkOrderMaterial material : materials) {
                if (material.getActualQuantity() != null) {
                    totalActualMaterialUsed = totalActualMaterialUsed.add(material.getActualQuantity());
                }
                if (material.getTotalAmount() != null) {
                    if (material.getMaterialName() != null && material.getMaterialName().contains("包装")) {
                        totalPackagingCost = totalPackagingCost.add(material.getTotalAmount());
                    } else {
                        totalMaterialCost = totalMaterialCost.add(material.getTotalAmount());
                    }
                }
                if (material.getWasteQuantity() != null && material.getUnitPrice() != null) {
                    totalMaterialWasteCost = totalMaterialWasteCost.add(
                            material.getWasteQuantity().multiply(material.getUnitPrice()));
                }
            }
        }

        BigDecimal totalInputQuantity = totalOutput.add(totalDefective);
        BigDecimal totalProductionWaste = totalPlanQuantity.compareTo(BigDecimal.ZERO) > 0
                ? totalPlanQuantity.subtract(totalInputQuantity)
                : BigDecimal.ZERO;

        if (totalOutput.compareTo(BigDecimal.ZERO) > 0 && totalPlanQuantity.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal avgUnitCost = totalPlanQuantity.multiply(new BigDecimal("5")).divide(totalOutput, 4, RoundingMode.HALF_UP);
            totalProcessWasteCost = totalProductionWaste.max(BigDecimal.ZERO).multiply(avgUnitCost);
        }

        statistics.setTotalOutputQuantity(totalOutput);
        statistics.setTotalDefectiveQuantity(totalDefective);
        statistics.setTotalInputQuantity(totalInputQuantity);
        statistics.setTotalWasteQuantity(totalDefective.add(totalProductionWaste.max(BigDecimal.ZERO)));
        statistics.setMaterialWasteCost(totalMaterialWasteCost);
        statistics.setProcessWasteCost(totalProcessWasteCost);
        statistics.setTotalWasteCost(totalMaterialWasteCost.add(totalProcessWasteCost));

        if (totalInputQuantity.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal defectiveRate = totalDefective.multiply(new BigDecimal("100"))
                    .divide(totalInputQuantity, 2, RoundingMode.HALF_UP);
            statistics.setDefectiveRate(defectiveRate);

            BigDecimal yieldRate = totalOutput.multiply(new BigDecimal("100"))
                    .divide(totalInputQuantity, 2, RoundingMode.HALF_UP);
            statistics.setYieldRate(yieldRate);
        } else {
            statistics.setDefectiveRate(BigDecimal.ZERO);
            statistics.setYieldRate(BigDecimal.ZERO);
        }

        if (totalPlanQuantity.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal materialUtilizationRate = totalActualMaterialUsed.multiply(new BigDecimal("100"))
                    .divide(totalPlanQuantity, 2, RoundingMode.HALF_UP);
            statistics.setMaterialUtilizationRate(materialUtilizationRate);
        } else {
            statistics.setMaterialUtilizationRate(BigDecimal.ZERO);
        }

        statistics.setTotalMaterialCost(totalMaterialCost);
        statistics.setTotalEnergyCost(totalEnergyCost);
        statistics.setTotalLaborCost(totalLaborCost);
        statistics.setTotalPackagingCost(totalPackagingCost);

        BigDecimal totalCost = totalMaterialCost.add(totalEnergyCost).add(totalLaborCost).add(totalPackagingCost);
        statistics.setTotalCost(totalCost);
        statistics.setTotalLaborHours(totalLaborHours);
        statistics.setTotalEnergyConsumption(totalEnergyConsumption);

        if (totalOutput.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal unitCost = totalCost.divide(totalOutput, 4, RoundingMode.HALF_UP);
            statistics.setUnitCost(unitCost);

            BigDecimal unitMaterialCost = totalMaterialCost.divide(totalOutput, 4, RoundingMode.HALF_UP);
            BigDecimal unitEnergyCost = totalEnergyCost.divide(totalOutput, 4, RoundingMode.HALF_UP);
            BigDecimal unitLaborCost = totalLaborCost.divide(totalOutput, 4, RoundingMode.HALF_UP);
            BigDecimal unitPackagingCost = totalPackagingCost.divide(totalOutput, 4, RoundingMode.HALF_UP);
            statistics.setUnitMaterialCost(unitMaterialCost);
            statistics.setUnitEnergyCost(unitEnergyCost);
            statistics.setUnitLaborCost(unitLaborCost);
            statistics.setUnitPackagingCost(unitPackagingCost);
        } else {
            statistics.setUnitCost(BigDecimal.ZERO);
            statistics.setUnitMaterialCost(BigDecimal.ZERO);
            statistics.setUnitEnergyCost(BigDecimal.ZERO);
            statistics.setUnitLaborCost(BigDecimal.ZERO);
            statistics.setUnitPackagingCost(BigDecimal.ZERO);
        }

        ProductionStatistics exists = statisticsMapper.selectOne(new LambdaQueryWrapper<ProductionStatistics>()
                .eq(ProductionStatistics::getStatisticsDate, date)
                .eq(ProductionStatistics::getStatisticsType, 1));

        if (exists != null) {
            statistics.setId(exists.getId());
            statisticsMapper.updateById(statistics);
        } else {
            statisticsMapper.insert(statistics);
        }

        return Result.success(statistics);
    }

    @Transactional(rollbackFor = Exception.class)
    public Result<ProductionStatistics> generateMonthlyStatistics(Integer year, Integer month) {
        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.plusMonths(1).minusDays(1);

        ProductionStatistics statistics = new ProductionStatistics();
        statistics.setStatisticsDate(endDate);
        statistics.setStatisticsType(2);

        LocalDateTime startOfMonth = startDate.atStartOfDay();
        LocalDateTime endOfMonth = endDate.atTime(23, 59, 59);

        List<WorkOrder> workOrders = workOrderMapper.selectList(new LambdaQueryWrapper<WorkOrder>()
                .ge(WorkOrder::getCreateTime, startOfMonth)
                .le(WorkOrder::getCreateTime, endOfMonth));

        statistics.setWorkOrderCount(workOrders.size());

        List<WorkOrder> completedOrders = workOrders.stream()
                .filter(o -> WorkOrderStatusEnum.COMPLETED.getCode().equals(o.getStatus()))
                .toList();
        statistics.setCompletedOrderCount(completedOrders.size());

        BigDecimal totalOutput = BigDecimal.ZERO;
        BigDecimal totalDefective = BigDecimal.ZERO;
        BigDecimal totalMaterialCost = BigDecimal.ZERO;
        BigDecimal totalEnergyCost = BigDecimal.ZERO;
        BigDecimal totalLaborCost = BigDecimal.ZERO;
        BigDecimal totalPackagingCost = BigDecimal.ZERO;
        BigDecimal totalLaborHours = BigDecimal.ZERO;
        BigDecimal totalEnergyConsumption = BigDecimal.ZERO;

        for (WorkOrder order : completedOrders) {
            if (order.getActualQuantity() != null) {
                totalOutput = totalOutput.add(order.getActualQuantity());
            }
            if (order.getTotalCost() != null) {
                totalMaterialCost = totalMaterialCost.add(order.getTotalCost());
            }

            List<WorkOrderProcess> processes = processMapper.selectList(new LambdaQueryWrapper<WorkOrderProcess>()
                    .eq(WorkOrderProcess::getWorkOrderId, order.getId()));

            for (WorkOrderProcess process : processes) {
                if (process.getDefectiveQuantity() != null) {
                    totalDefective = totalDefective.add(process.getDefectiveQuantity());
                }
                if (process.getLaborHours() != null) {
                    totalLaborHours = totalLaborHours.add(process.getLaborHours());
                    totalLaborCost = totalLaborCost.add(process.getLaborHours().multiply(new BigDecimal("50")));
                }
                if (process.getEnergyConsumption() != null) {
                    totalEnergyConsumption = totalEnergyConsumption.add(process.getEnergyConsumption());
                    totalEnergyCost = totalEnergyCost.add(process.getEnergyConsumption().multiply(new BigDecimal("1.5")));
                }
            }

            List<WorkOrderMaterial> materials = materialMapper.selectList(new LambdaQueryWrapper<WorkOrderMaterial>()
                    .eq(WorkOrderMaterial::getWorkOrderId, order.getId()));

            for (WorkOrderMaterial material : materials) {
                if (material.getTotalAmount() != null) {
                    if (material.getMaterialName() != null && material.getMaterialName().contains("包装")) {
                        totalPackagingCost = totalPackagingCost.add(material.getTotalAmount());
                    }
                }
            }
        }

        statistics.setTotalOutputQuantity(totalOutput);
        statistics.setTotalDefectiveQuantity(totalDefective);

        if (totalOutput.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal defectiveRate = totalDefective.multiply(new BigDecimal("100"))
                    .divide(totalOutput.add(totalDefective), 2, RoundingMode.HALF_UP);
            statistics.setDefectiveRate(defectiveRate);
        } else {
            statistics.setDefectiveRate(BigDecimal.ZERO);
        }

        statistics.setTotalMaterialCost(totalMaterialCost);
        statistics.setTotalEnergyCost(totalEnergyCost);
        statistics.setTotalLaborCost(totalLaborCost);
        statistics.setTotalPackagingCost(totalPackagingCost);
        statistics.setTotalCost(totalMaterialCost.add(totalEnergyCost).add(totalLaborCost).add(totalPackagingCost));
        statistics.setTotalLaborHours(totalLaborHours);
        statistics.setTotalEnergyConsumption(totalEnergyConsumption);

        ProductionStatistics exists = statisticsMapper.selectOne(new LambdaQueryWrapper<ProductionStatistics>()
                .eq(ProductionStatistics::getStatisticsDate, endDate)
                .eq(ProductionStatistics::getStatisticsType, 2));

        if (exists != null) {
            statistics.setId(exists.getId());
            statisticsMapper.updateById(statistics);
        } else {
            statisticsMapper.insert(statistics);
        }

        return Result.success(statistics);
    }

    public Result<IPage<ProductionStatistics>> getStatisticsPage(StatisticsQueryDTO dto) {
        LambdaQueryWrapper<ProductionStatistics> wrapper = new LambdaQueryWrapper<>();
        wrapper.ge(dto.getStatisticsDateStart() != null, ProductionStatistics::getStatisticsDate, dto.getStatisticsDateStart())
                .le(dto.getStatisticsDateEnd() != null, ProductionStatistics::getStatisticsDate, dto.getStatisticsDateEnd())
                .eq(dto.getStatisticsType() != null, ProductionStatistics::getStatisticsType, dto.getStatisticsType())
                .orderByDesc(ProductionStatistics::getStatisticsDate);

        IPage<ProductionStatistics> page = statisticsMapper.selectPage(dto.buildPage(), wrapper);
        return Result.success(page);
    }

    public Result<Map<String, Object>> getDashboardData() {
        Map<String, Object> result = new HashMap<>();

        LocalDate today = LocalDate.now();
        LocalDateTime startOfDay = today.atStartOfDay();
        LocalDateTime endOfDay = today.atTime(23, 59, 59);

        Long todayOrderCount = workOrderMapper.selectCount(new LambdaQueryWrapper<WorkOrder>()
                .ge(WorkOrder::getCreateTime, startOfDay)
                .le(WorkOrder::getCreateTime, endOfDay));
        result.put("todayOrderCount", todayOrderCount);

        Long pendingOrderCount = workOrderMapper.selectCount(new LambdaQueryWrapper<WorkOrder>()
                .eq(WorkOrder::getStatus, WorkOrderStatusEnum.PENDING.getCode()));
        result.put("pendingOrderCount", pendingOrderCount);

        Long inProductionCount = workOrderMapper.selectCount(new LambdaQueryWrapper<WorkOrder>()
                .eq(WorkOrder::getStatus, WorkOrderStatusEnum.IN_PRODUCTION.getCode()));
        result.put("inProductionCount", inProductionCount);

        Long completedCount = workOrderMapper.selectCount(new LambdaQueryWrapper<WorkOrder>()
                .eq(WorkOrder::getStatus, WorkOrderStatusEnum.COMPLETED.getCode())
                .ge(WorkOrder::getActualEndTime, startOfDay));
        result.put("todayCompletedCount", completedCount);

        List<WorkOrder> recentOrders = workOrderMapper.selectList(new LambdaQueryWrapper<WorkOrder>()
                .orderByDesc(WorkOrder::getCreateTime)
                .last("LIMIT 10"));
        result.put("recentOrders", recentOrders);

        LocalDate monthStart = today.withDayOfMonth(1);
        List<ProductionStatistics> monthStatistics = statisticsMapper.selectList(new LambdaQueryWrapper<ProductionStatistics>()
                .ge(ProductionStatistics::getStatisticsDate, monthStart)
                .eq(ProductionStatistics::getStatisticsType, 1)
                .orderByAsc(ProductionStatistics::getStatisticsDate));
        result.put("monthStatistics", monthStatistics);

        return Result.success(result);
    }

    public Result<Map<String, Object>> getWorkOrderMaterialDetail(Long workOrderId) {
        Map<String, Object> result = new HashMap<>();

        WorkOrder workOrder = workOrderMapper.selectById(workOrderId);
        result.put("workOrder", workOrder);

        List<WorkOrderMaterial> materials = materialMapper.selectList(new LambdaQueryWrapper<WorkOrderMaterial>()
                .eq(WorkOrderMaterial::getWorkOrderId, workOrderId));
        result.put("materials", materials);

        BigDecimal totalMaterialCost = materials.stream()
                .map(m -> m.getTotalAmount() != null ? m.getTotalAmount() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        result.put("totalMaterialCost", totalMaterialCost);

        List<WorkOrderProcess> processes = processMapper.selectList(new LambdaQueryWrapper<WorkOrderProcess>()
                .eq(WorkOrderProcess::getWorkOrderId, workOrderId)
                .orderByAsc(WorkOrderProcess::getSortOrder));
        result.put("processes", processes);

        BigDecimal totalLaborHours = processes.stream()
                .map(p -> p.getLaborHours() != null ? p.getLaborHours() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalLaborCost = totalLaborHours.multiply(new BigDecimal("50"));
        result.put("totalLaborCost", totalLaborCost);

        BigDecimal totalEnergyConsumption = processes.stream()
                .map(p -> p.getEnergyConsumption() != null ? p.getEnergyConsumption() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalEnergyCost = totalEnergyConsumption.multiply(new BigDecimal("1.5"));
        result.put("totalEnergyCost", totalEnergyCost);

        BigDecimal totalCost = totalMaterialCost.add(totalLaborCost).add(totalEnergyCost);
        result.put("totalCost", totalCost);

        return Result.success(result);
    }

    public Result<Map<String, Object>> getCostAnalysis(LocalDate startDate, LocalDate endDate) {
        Map<String, Object> result = new HashMap<>();

        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(23, 59, 59);

        List<WorkOrder> completedOrders = workOrderMapper.selectList(new LambdaQueryWrapper<WorkOrder>()
                .eq(WorkOrder::getStatus, WorkOrderStatusEnum.COMPLETED.getCode())
                .ge(WorkOrder::getActualEndTime, start)
                .le(WorkOrder::getActualEndTime, end));

        BigDecimal totalMaterialCost = BigDecimal.ZERO;
        BigDecimal totalEnergyCost = BigDecimal.ZERO;
        BigDecimal totalLaborCost = BigDecimal.ZERO;
        BigDecimal totalPackagingCost = BigDecimal.ZERO;
        BigDecimal totalOutput = BigDecimal.ZERO;

        for (WorkOrder order : completedOrders) {
            if (order.getActualQuantity() != null) {
                totalOutput = totalOutput.add(order.getActualQuantity());
            }

            List<WorkOrderMaterial> materials = materialMapper.selectList(new LambdaQueryWrapper<WorkOrderMaterial>()
                    .eq(WorkOrderMaterial::getWorkOrderId, order.getId()));

            for (WorkOrderMaterial material : materials) {
                if (material.getTotalAmount() != null) {
                    if (material.getMaterialName() != null && material.getMaterialName().contains("包装")) {
                        totalPackagingCost = totalPackagingCost.add(material.getTotalAmount());
                    } else {
                        totalMaterialCost = totalMaterialCost.add(material.getTotalAmount());
                    }
                }
            }

            List<WorkOrderProcess> processes = processMapper.selectList(new LambdaQueryWrapper<WorkOrderProcess>()
                    .eq(WorkOrderProcess::getWorkOrderId, order.getId()));

            for (WorkOrderProcess process : processes) {
                if (process.getLaborHours() != null) {
                    totalLaborCost = totalLaborCost.add(process.getLaborHours().multiply(new BigDecimal("50")));
                }
                if (process.getEnergyConsumption() != null) {
                    totalEnergyCost = totalEnergyCost.add(process.getEnergyConsumption().multiply(new BigDecimal("1.5")));
                }
            }
        }

        BigDecimal totalCost = totalMaterialCost.add(totalEnergyCost).add(totalLaborCost).add(totalPackagingCost);

        result.put("totalMaterialCost", totalMaterialCost);
        result.put("totalEnergyCost", totalEnergyCost);
        result.put("totalLaborCost", totalLaborCost);
        result.put("totalPackagingCost", totalPackagingCost);
        result.put("totalCost", totalCost);
        result.put("totalOutput", totalOutput);

        if (totalOutput.compareTo(BigDecimal.ZERO) > 0) {
            result.put("unitCost", totalCost.divide(totalOutput, 4, RoundingMode.HALF_UP));
        } else {
            result.put("unitCost", BigDecimal.ZERO);
        }

        List<Map<String, Object>> costStructure = new ArrayList<>();
        costStructure.add(Map.of("name", "原料成本", "value", totalMaterialCost));
        costStructure.add(Map.of("name", "能耗成本", "value", totalEnergyCost));
        costStructure.add(Map.of("name", "人工成本", "value", totalLaborCost));
        costStructure.add(Map.of("name", "包装成本", "value", totalPackagingCost));
        result.put("costStructure", costStructure);

        return Result.success(result);
    }

    public Result<Map<String, Object>> getTrendAnalysis(LocalDate startDate, LocalDate endDate) {
        Map<String, Object> result = new HashMap<>();
        List<Map<String, Object>> dailyData = new ArrayList<>();

        LocalDate current = startDate;
        while (!current.isAfter(endDate)) {
            LocalDateTime dayStart = current.atStartOfDay();
            LocalDateTime dayEnd = current.atTime(23, 59, 59);

            List<WorkOrder> orders = workOrderMapper.selectList(new LambdaQueryWrapper<WorkOrder>()
                    .ge(WorkOrder::getCreateTime, dayStart)
                    .le(WorkOrder::getCreateTime, dayEnd));

            long completedCount = orders.stream()
                    .filter(o -> WorkOrderStatusEnum.COMPLETED.getCode().equals(o.getStatus()))
                    .count();

            BigDecimal output = orders.stream()
                    .filter(o -> WorkOrderStatusEnum.COMPLETED.getCode().equals(o.getStatus()))
                    .map(WorkOrder::getActualQuantity)
                    .filter(q -> q != null)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            Map<String, Object> dayData = new HashMap<>();
            dayData.put("date", current.toString());
            dayData.put("orderCount", orders.size());
            dayData.put("completedCount", completedCount);
            dayData.put("output", output);
            dailyData.add(dayData);

            current = current.plusDays(1);
        }

        result.put("dailyData", dailyData);
        return Result.success(result);
    }

    public Result<Map<String, Object>> getQualityAnalysis(LocalDate startDate, LocalDate endDate) {
        Map<String, Object> result = new HashMap<>();

        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(23, 59, 59);

        try {
            QualityInspectionMapper inspectionMapper = getInspectionMapper();
            if (inspectionMapper != null) {
                List<QualityInspection> inspections = inspectionMapper.selectList(new LambdaQueryWrapper<QualityInspection>()
                        .ge(QualityInspection::getInspectionTime, start)
                        .le(QualityInspection::getInspectionTime, end));

                long totalCount = inspections.size();
                long qualifiedCount = inspections.stream()
                        .filter(i -> i.getInspectionResult() != null && i.getInspectionResult() == 1)
                        .count();
                long unqualifiedCount = inspections.stream()
                        .filter(i -> i.getInspectionResult() != null && i.getInspectionResult() == 2)
                        .count();
                long concessionCount = inspections.stream()
                        .filter(i -> i.getInspectionResult() != null && i.getInspectionResult() == 3)
                        .count();

                BigDecimal passRate = totalCount > 0
                        ? new BigDecimal(qualifiedCount).multiply(new BigDecimal("100"))
                                .divide(new BigDecimal(totalCount), 2, RoundingMode.HALF_UP)
                        : BigDecimal.ZERO;

                result.put("totalInspectionCount", totalCount);
                result.put("qualifiedCount", qualifiedCount);
                result.put("unqualifiedCount", unqualifiedCount);
                result.put("concessionCount", concessionCount);
                result.put("passRate", passRate);

                List<Map<String, Object>> qualityStructure = new ArrayList<>();
                qualityStructure.add(Map.of("name", "合格", "value", qualifiedCount));
                qualityStructure.add(Map.of("name", "不合格", "value", unqualifiedCount));
                qualityStructure.add(Map.of("name", "让步接收", "value", concessionCount));
                result.put("qualityStructure", qualityStructure);
            }
        } catch (Exception e) {
            log.warn("质量统计模块暂未完全初始化", e);
        }

        return Result.success(result);
    }

    public Result<Map<String, Object>> getMaterialConsumptionAnalysis(LocalDate startDate, LocalDate endDate) {
        Map<String, Object> result = new HashMap<>();

        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(23, 59, 59);

        List<WorkOrder> completedOrders = workOrderMapper.selectList(new LambdaQueryWrapper<WorkOrder>()
                .eq(WorkOrder::getStatus, WorkOrderStatusEnum.COMPLETED.getCode())
                .ge(WorkOrder::getActualEndTime, start)
                .le(WorkOrder::getActualEndTime, end));

        Map<String, Map<String, Object>> materialStats = new HashMap<>();

        for (WorkOrder order : completedOrders) {
            List<WorkOrderMaterial> materials = materialMapper.selectList(new LambdaQueryWrapper<WorkOrderMaterial>()
                    .eq(WorkOrderMaterial::getWorkOrderId, order.getId()));

            for (WorkOrderMaterial material : materials) {
                String key = material.getMaterialId() + "_" + material.getMaterialName();
                Map<String, Object> stat = materialStats.computeIfAbsent(key, k -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("materialId", material.getMaterialId());
                    m.put("materialName", material.getMaterialName());
                    m.put("materialCode", material.getMaterialCode());
                    m.put("unit", material.getUnit());
                    m.put("totalQuantity", BigDecimal.ZERO);
                    m.put("totalAmount", BigDecimal.ZERO);
                    m.put("totalWaste", BigDecimal.ZERO);
                    return m;
                });

                if (material.getActualQuantity() != null) {
                    stat.put("totalQuantity", ((BigDecimal) stat.get("totalQuantity")).add(material.getActualQuantity()));
                }
                if (material.getTotalAmount() != null) {
                    stat.put("totalAmount", ((BigDecimal) stat.get("totalAmount")).add(material.getTotalAmount()));
                }
                if (material.getWasteQuantity() != null) {
                    stat.put("totalWaste", ((BigDecimal) stat.get("totalWaste")).add(material.getWasteQuantity()));
                }
            }
        }

        result.put("materialConsumption", new ArrayList<>(materialStats.values()));
        return Result.success(result);
    }

    public Result<Map<String, Object>> getMonthlyComparison(Integer year) {
        Map<String, Object> result = new HashMap<>();
        List<Map<String, Object>> monthlyData = new ArrayList<>();

        for (int month = 1; month <= 12; month++) {
            LocalDate monthStart = LocalDate.of(year, month, 1);
            LocalDate monthEnd = monthStart.with(TemporalAdjusters.lastDayOfMonth());

            ProductionStatistics stats = statisticsMapper.selectOne(new LambdaQueryWrapper<ProductionStatistics>()
                    .eq(ProductionStatistics::getStatisticsDate, monthEnd)
                    .eq(ProductionStatistics::getStatisticsType, 2));

            Map<String, Object> monthData = new HashMap<>();
            monthData.put("month", month + "月");
            if (stats != null) {
                monthData.put("orderCount", stats.getWorkOrderCount());
                monthData.put("completedCount", stats.getCompletedOrderCount());
                monthData.put("output", stats.getTotalOutputQuantity());
                monthData.put("cost", stats.getTotalCost());
                monthData.put("defectiveRate", stats.getDefectiveRate());
            } else {
                monthData.put("orderCount", 0);
                monthData.put("completedCount", 0);
                monthData.put("output", BigDecimal.ZERO);
                monthData.put("cost", BigDecimal.ZERO);
                monthData.put("defectiveRate", BigDecimal.ZERO);
            }
            monthlyData.add(monthData);
        }

        result.put("monthlyData", monthlyData);
        return Result.success(result);
    }

    private QualityInspectionMapper inspectionMapperInstance;

    public QualityInspectionMapper getInspectionMapper() {
        if (inspectionMapperInstance == null) {
            try {
                inspectionMapperInstance = applicationContext.getBean(QualityInspectionMapper.class);
            } catch (Exception e) {
                log.debug("QualityInspectionMapper not available yet");
            }
        }
        return inspectionMapperInstance;
    }

    private org.springframework.context.ApplicationContext applicationContext;

    @org.springframework.beans.factory.annotation.Autowired
    public void setApplicationContext(org.springframework.context.ApplicationContext context) {
        this.applicationContext = context;
    }
}
