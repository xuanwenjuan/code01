package com.firecontrol.service.impl;

import cn.hutool.core.date.DateUtil;
import cn.hutool.core.util.StrUtil;
import com.alibaba.excel.EasyExcel;
import com.alibaba.excel.annotation.ExcelProperty;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.firecontrol.common.PageQuery;
import com.firecontrol.common.ResultCode;
import com.firecontrol.entity.*;
import com.firecontrol.exception.BusinessException;
import com.firecontrol.mapper.*;
import com.firecontrol.service.ProductionCostService;
import com.firecontrol.vo.CostAnalysisVO;
import com.firecontrol.vo.CostStatisticsVO;
import jakarta.annotation.Resource;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.Serializable;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
public class ProductionCostServiceImpl implements ProductionCostService {

    @Resource
    private ProductionCostMapper productionCostMapper;

    @Resource
    private WorkOrderMapper workOrderMapper;

    @Resource
    private WorkOrderMaterialMapper workOrderMaterialMapper;

    @Resource
    private MaterialMapper materialMapper;

    @Resource
    private ProductCategoryMapper productCategoryMapper;

    @Resource
    private WorkOrderLaborMapper workOrderLaborMapper;

    @Resource
    private WorkOrderProcessMapper workOrderProcessMapper;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void calculateWorkOrderCost(Long workOrderId) {
        WorkOrder workOrder = workOrderMapper.selectById(workOrderId);
        if (workOrder == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }

        if (workOrder.getStatus() != 4) {
            throw new BusinessException("只有已完成的工单才能核算成本");
        }

        LambdaQueryWrapper<ProductionCost> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ProductionCost::getWorkOrderId, workOrderId);
        Long existingCount = productionCostMapper.selectCount(wrapper);
        if (existingCount > 0) {
            throw new BusinessException("该工单成本已核算");
        }

        BigDecimal productionQuantity = workOrder.getActualQuantity() != null
                ? workOrder.getActualQuantity() : BigDecimal.ZERO;
        BigDecimal qualifiedQuantity = workOrder.getQualifiedQuantity() != null
                ? workOrder.getQualifiedQuantity() : BigDecimal.ZERO;
        BigDecimal scrapQuantity = workOrder.getScrapQuantity() != null
                ? workOrder.getScrapQuantity() : BigDecimal.ZERO;

        List<WorkOrderMaterial> materials = workOrderMaterialMapper.selectList(
                new LambdaQueryWrapper<WorkOrderMaterial>()
                        .eq(WorkOrderMaterial::getWorkOrderId, workOrderId)
        );

        BigDecimal materialCost = BigDecimal.ZERO;
        BigDecimal scrapMaterialCost = BigDecimal.ZERO;
        for (WorkOrderMaterial mat : materials) {
            Material material = materialMapper.selectById(mat.getMaterialId());
            if (material != null && material.getUnitPrice() != null) {
                BigDecimal actualQty = mat.getActualQuantity() != null ? mat.getActualQuantity() : BigDecimal.ZERO;
                BigDecimal scrapQty = mat.getScrapQuantity() != null ? mat.getScrapQuantity() : BigDecimal.ZERO;

                BigDecimal matCost = actualQty.multiply(material.getUnitPrice());
                materialCost = materialCost.add(matCost);

                BigDecimal scrapMatCost = scrapQty.multiply(material.getUnitPrice());
                scrapMaterialCost = scrapMaterialCost.add(scrapMatCost);
            }
        }

        List<WorkOrderProcess> processes = workOrderProcessMapper.selectList(
                new LambdaQueryWrapper<WorkOrderProcess>()
                        .eq(WorkOrderProcess::getWorkOrderId, workOrderId)
        );

        BigDecimal totalProcessHours = BigDecimal.ZERO;
        for (WorkOrderProcess process : processes) {
            if (process.getStartTime() != null && process.getEndTime() != null) {
                long minutes = ChronoUnit.MINUTES.between(process.getStartTime(), process.getEndTime());
                totalProcessHours = totalProcessHours.add(new BigDecimal(minutes).divide(new BigDecimal(60), 4, RoundingMode.HALF_UP));
            }
        }

        BigDecimal equipmentCost = totalProcessHours.multiply(new BigDecimal("120.00"));
        BigDecimal energyCost = totalProcessHours.multiply(new BigDecimal("45.00"));

        List<WorkOrderLabor> labors = workOrderLaborMapper.selectList(
                new LambdaQueryWrapper<WorkOrderLabor>()
                        .eq(WorkOrderLabor::getWorkOrderId, workOrderId)
        );

        BigDecimal laborCost = BigDecimal.ZERO;
        if (!labors.isEmpty()) {
            laborCost = labors.stream()
                    .map(l -> l.getLaborCost() != null ? l.getLaborCost() : BigDecimal.ZERO)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
        } else {
            laborCost = totalProcessHours.multiply(new BigDecimal("80.00"));
        }

        BigDecimal qualityCost = BigDecimal.ZERO;
        for (WorkOrderProcess process : processes) {
            if ("FIRE_TEST".equals(process.getProcessCode()) || "PRESSURE_TEST".equals(process.getProcessCode())) {
                if (process.getStartTime() != null && process.getEndTime() != null) {
                    long minutes = ChronoUnit.MINUTES.between(process.getStartTime(), process.getEndTime());
                    BigDecimal hours = new BigDecimal(minutes).divide(new BigDecimal(60), 4, RoundingMode.HALF_UP);
                    qualityCost = qualityCost.add(hours.multiply(new BigDecimal("150.00")));
                }
            }
        }

        BigDecimal scrapCost = scrapMaterialCost;
        if (scrapQuantity.compareTo(BigDecimal.ZERO) > 0 && productionQuantity.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal unitMaterialCost = materialCost.divide(productionQuantity, 4, RoundingMode.HALF_UP);
            BigDecimal additionalScrapCost = scrapQuantity.multiply(unitMaterialCost);
            scrapCost = scrapCost.add(additionalScrapCost);
        }

        BigDecimal totalCost = materialCost
                .add(equipmentCost)
                .add(energyCost)
                .add(laborCost)
                .add(qualityCost)
                .add(scrapCost);

        BigDecimal unitCost = BigDecimal.ZERO;
        if (qualifiedQuantity.compareTo(BigDecimal.ZERO) > 0) {
            unitCost = totalCost.divide(qualifiedQuantity, 4, RoundingMode.HALF_UP);
        }

        BigDecimal materialCostRatio = BigDecimal.ZERO;
        BigDecimal laborCostRatio = BigDecimal.ZERO;
        BigDecimal scrapRate = BigDecimal.ZERO;

        if (totalCost.compareTo(BigDecimal.ZERO) > 0) {
            materialCostRatio = materialCost.divide(totalCost, 4, RoundingMode.HALF_UP).multiply(new BigDecimal(100));
            laborCostRatio = laborCost.divide(totalCost, 4, RoundingMode.HALF_UP).multiply(new BigDecimal(100));
        }
        if (productionQuantity.compareTo(BigDecimal.ZERO) > 0) {
            scrapRate = scrapQuantity.divide(productionQuantity, 4, RoundingMode.HALF_UP).multiply(new BigDecimal(100));
        }

        ProductionCost cost = new ProductionCost();
        cost.setCostNo("COST" + DateUtil.format(DateUtil.date(), "yyyyMMddHHmmss"));
        cost.setWorkOrderId(workOrderId);
        cost.setOrderNo(workOrder.getOrderNo());
        cost.setProductId(workOrder.getProductId());
        cost.setProductName(workOrder.getProductName());
        cost.setCategoryName(workOrder.getCategoryName());
        cost.setProductionQuantity(productionQuantity);
        cost.setQualifiedQuantity(qualifiedQuantity);
        cost.setScrapQuantity(scrapQuantity);
        cost.setMaterialCost(materialCost);
        cost.setEquipmentCost(equipmentCost);
        cost.setEnergyCost(energyCost);
        cost.setLaborCost(laborCost);
        cost.setQualityCost(qualityCost);
        cost.setScrapCost(scrapCost);
        cost.setTotalCost(totalCost);
        cost.setUnitCost(unitCost);
        cost.setMaterialCostRatio(materialCostRatio);
        cost.setLaborCostRatio(laborCostRatio);
        cost.setScrapRate(scrapRate);
        cost.setCostDate(LocalDate.now());
        cost.setCostPeriod(DateUtil.format(DateUtil.date(), "yyyy-MM"));
        cost.setRemark("自动核算 - 生产工时：" + totalProcessHours.setScale(2, RoundingMode.HALF_UP) + "小时");

        productionCostMapper.insert(cost);
    }

    @Override
    public ProductionCost getCostById(Long id) {
        return productionCostMapper.selectById(id);
    }

    @Override
    public IPage<ProductionCost> getCostPage(ProductionCost cost, PageQuery pageQuery) {
        Page<ProductionCost> page = new Page<>(pageQuery.getPageNum(), pageQuery.getPageSize());
        LambdaQueryWrapper<ProductionCost> wrapper = new LambdaQueryWrapper<>();

        if (StrUtil.isNotBlank(cost.getCostNo())) {
            wrapper.like(ProductionCost::getCostNo, cost.getCostNo());
        }
        if (StrUtil.isNotBlank(cost.getOrderNo())) {
            wrapper.like(ProductionCost::getOrderNo, cost.getOrderNo());
        }
        if (cost.getProductId() != null) {
            wrapper.eq(ProductionCost::getProductId, cost.getProductId());
        }
        if (StrUtil.isNotBlank(cost.getCostPeriod())) {
            wrapper.eq(ProductionCost::getCostPeriod, cost.getCostPeriod());
        }

        wrapper.orderByDesc(ProductionCost::getCreateTime);
        return productionCostMapper.selectPage(page, wrapper);
    }

    @Override
    public CostStatisticsVO getCostStatistics(LocalDate startDate, LocalDate endDate) {
        List<ProductionCost> costs = productionCostMapper.selectByDateRange(startDate, endDate);

        CostStatisticsVO vo = new CostStatisticsVO();
        vo.setTotalMaterialCost(BigDecimal.ZERO);
        vo.setTotalEquipmentCost(BigDecimal.ZERO);
        vo.setTotalEnergyCost(BigDecimal.ZERO);
        vo.setTotalLaborCost(BigDecimal.ZERO);
        vo.setTotalScrapCost(BigDecimal.ZERO);
        vo.setTotalCost(BigDecimal.ZERO);
        vo.setTotalProductionQuantity(BigDecimal.ZERO);
        vo.setWorkOrderCount((long) costs.size());

        for (ProductionCost cost : costs) {
            vo.setTotalMaterialCost(vo.getTotalMaterialCost().add(cost.getMaterialCost() != null ? cost.getMaterialCost() : BigDecimal.ZERO));
            vo.setTotalEquipmentCost(vo.getTotalEquipmentCost().add(cost.getEquipmentCost() != null ? cost.getEquipmentCost() : BigDecimal.ZERO));
            vo.setTotalEnergyCost(vo.getTotalEnergyCost().add(cost.getEnergyCost() != null ? cost.getEnergyCost() : BigDecimal.ZERO));
            vo.setTotalLaborCost(vo.getTotalLaborCost().add(cost.getLaborCost() != null ? cost.getLaborCost() : BigDecimal.ZERO));
            vo.setTotalScrapCost(vo.getTotalScrapCost().add(cost.getScrapCost() != null ? cost.getScrapCost() : BigDecimal.ZERO));
            vo.setTotalCost(vo.getTotalCost().add(cost.getTotalCost() != null ? cost.getTotalCost() : BigDecimal.ZERO));
            vo.setTotalProductionQuantity(vo.getTotalProductionQuantity().add(cost.getProductionQuantity() != null ? cost.getProductionQuantity() : BigDecimal.ZERO));
        }

        if (vo.getTotalProductionQuantity().compareTo(BigDecimal.ZERO) > 0) {
            vo.setAverageUnitCost(vo.getTotalCost().divide(vo.getTotalProductionQuantity(), 2, RoundingMode.HALF_UP));
        } else {
            vo.setAverageUnitCost(BigDecimal.ZERO);
        }

        if (vo.getTotalCost().compareTo(BigDecimal.ZERO) > 0) {
            vo.setMaterialCostRatio(vo.getTotalMaterialCost().divide(vo.getTotalCost(), 4, RoundingMode.HALF_UP).multiply(new BigDecimal("100")).setScale(2, RoundingMode.HALF_UP) + "%");
            vo.setEquipmentCostRatio(vo.getTotalEquipmentCost().divide(vo.getTotalCost(), 4, RoundingMode.HALF_UP).multiply(new BigDecimal("100")).setScale(2, RoundingMode.HALF_UP) + "%");
            vo.setEnergyCostRatio(vo.getTotalEnergyCost().divide(vo.getTotalCost(), 4, RoundingMode.HALF_UP).multiply(new BigDecimal("100")).setScale(2, RoundingMode.HALF_UP) + "%");
            vo.setLaborCostRatio(vo.getTotalLaborCost().divide(vo.getTotalCost(), 4, RoundingMode.HALF_UP).multiply(new BigDecimal("100")).setScale(2, RoundingMode.HALF_UP) + "%");
            vo.setScrapCostRatio(vo.getTotalScrapCost().divide(vo.getTotalCost(), 4, RoundingMode.HALF_UP).multiply(new BigDecimal("100")).setScale(2, RoundingMode.HALF_UP) + "%");
        } else {
            vo.setMaterialCostRatio("0%");
            vo.setEquipmentCostRatio("0%");
            vo.setEnergyCostRatio("0%");
            vo.setLaborCostRatio("0%");
            vo.setScrapCostRatio("0%");
        }

        return vo;
    }

    @Override
    public List<ProductionCost> getCostByDateRange(LocalDate startDate, LocalDate endDate) {
        return productionCostMapper.selectByDateRange(startDate, endDate);
    }

    @Override
    public List<ProductionCost> getCostByWorkOrderId(Long workOrderId) {
        return productionCostMapper.selectByWorkOrderId(workOrderId);
    }

    @Override
    public void generateMonthlyReport() {
        log.info("开始生成月度成本报表");
        try {
            LocalDate now = LocalDate.now();
            LocalDate firstDay = now.withDayOfMonth(1);
            LocalDate lastDay = now.withDayOfMonth(now.lengthOfMonth());
            CostStatisticsVO statistics = getCostStatistics(firstDay, lastDay);
            log.info("月度成本统计完成，总成本：{}", statistics.getTotalCost());
        } catch (Exception e) {
            log.error("生成月度成本报表失败", e);
        }
    }

    @Override
    public byte[] exportWorkOrderMaterialDetail(Long workOrderId) {
        WorkOrder workOrder = workOrderMapper.selectById(workOrderId);
        if (workOrder == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }

        List<WorkOrderMaterial> materials = workOrderMaterialMapper.selectList(
                new LambdaQueryWrapper<WorkOrderMaterial>()
                        .eq(WorkOrderMaterial::getWorkOrderId, workOrderId)
        );

        List<MaterialExportVO> exportList = materials.stream().map(mat -> {
            MaterialExportVO vo = new MaterialExportVO();
            vo.setOrderNo(mat.getOrderNo());
            vo.setMaterialCode(mat.getMaterialCode());
            vo.setMaterialName(mat.getMaterialName());
            vo.setSpecification(mat.getSpecification());
            vo.setUnit(mat.getUnit());
            vo.setRequiredQuantity(mat.getRequiredQuantity());
            vo.setActualQuantity(mat.getActualQuantity());
            vo.setReturnedQuantity(mat.getReturnedQuantity());
            vo.setScrapQuantity(mat.getScrapQuantity());
            vo.setRemark(mat.getRemark());
            return vo;
        }).toList();

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        EasyExcel.write(out, MaterialExportVO.class)
                .sheet("工单用料明细")
                .doWrite(exportList);

        return out.toByteArray();
    }

    @Data
    public static class MaterialExportVO implements Serializable {
        @ExcelProperty("工单号")
        private String orderNo;

        @ExcelProperty("物资编码")
        private String materialCode;

        @ExcelProperty("物资名称")
        private String materialName;

        @ExcelProperty("规格型号")
        private String specification;

        @ExcelProperty("单位")
        private String unit;

        @ExcelProperty("需求数量")
        private BigDecimal requiredQuantity;

        @ExcelProperty("实际用量")
        private BigDecimal actualQuantity;

        @ExcelProperty("退库数量")
        private BigDecimal returnedQuantity;

        @ExcelProperty("报废数量")
        private BigDecimal scrapQuantity;

        @ExcelProperty("备注")
        private String remark;
    }

    @Override
    public CostAnalysisVO getCostAnalysis(LocalDate startDate, LocalDate endDate) {
        List<ProductionCost> costs = productionCostMapper.selectList(
                new LambdaQueryWrapper<ProductionCost>()
                        .ge(ProductionCost::getCostDate, startDate)
                        .le(ProductionCost::getCostDate, endDate)
        );

        CostAnalysisVO vo = new CostAnalysisVO();
        vo.setStartDate(startDate);
        vo.setEndDate(endDate);

        BigDecimal totalCost = costs.stream()
                .map(ProductionCost::getTotalCost)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        vo.setTotalCost(totalCost);

        long workOrderCount = costs.stream()
                .map(ProductionCost::getWorkOrderId)
                .distinct()
                .count();
        vo.setTotalWorkOrders(workOrderCount);

        BigDecimal totalQuantity = costs.stream()
                .map(c -> c.getProductionQuantity() != null ? c.getProductionQuantity() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        vo.setTotalQuantity(totalQuantity);

        if (totalQuantity.compareTo(BigDecimal.ZERO) > 0) {
            vo.setAvgCostPerUnit(totalCost.divide(totalQuantity, 4, RoundingMode.HALF_UP));
        } else {
            vo.setAvgCostPerUnit(BigDecimal.ZERO);
        }

        CostAnalysisVO.CostBreakdownVO breakdown = new CostAnalysisVO.CostBreakdownVO();
        BigDecimal materialCost = costs.stream()
                .map(c -> c.getMaterialCost() != null ? c.getMaterialCost() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal equipmentCost = costs.stream()
                .map(c -> c.getEquipmentCost() != null ? c.getEquipmentCost() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal energyCost = costs.stream()
                .map(c -> c.getEnergyCost() != null ? c.getEnergyCost() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal laborCost = costs.stream()
                .map(c -> c.getLaborCost() != null ? c.getLaborCost() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal scrapCost = costs.stream()
                .map(c -> c.getScrapCost() != null ? c.getScrapCost() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        breakdown.setMaterialCost(materialCost);
        breakdown.setEquipmentCost(equipmentCost);
        breakdown.setEnergyCost(energyCost);
        breakdown.setLaborCost(laborCost);
        breakdown.setScrapCost(scrapCost);

        if (totalCost.compareTo(BigDecimal.ZERO) > 0) {
            breakdown.setMaterialCostRatio(materialCost.divide(totalCost, 4, RoundingMode.HALF_UP).multiply(new BigDecimal(100)));
            breakdown.setEquipmentCostRatio(equipmentCost.divide(totalCost, 4, RoundingMode.HALF_UP).multiply(new BigDecimal(100)));
            breakdown.setEnergyCostRatio(energyCost.divide(totalCost, 4, RoundingMode.HALF_UP).multiply(new BigDecimal(100)));
            breakdown.setLaborCostRatio(laborCost.divide(totalCost, 4, RoundingMode.HALF_UP).multiply(new BigDecimal(100)));
            breakdown.setScrapCostRatio(scrapCost.divide(totalCost, 4, RoundingMode.HALF_UP).multiply(new BigDecimal(100)));
        }
        vo.setCostBreakdown(breakdown);

        Map<String, List<ProductionCost>> monthlyMap = costs.stream()
                .collect(Collectors.groupingBy(c -> c.getCostDate().format(DateTimeFormatter.ofPattern("yyyy-MM"))));
        List<CostAnalysisVO.MonthlyCostVO> monthlyTrend = monthlyMap.entrySet().stream()
                .map(entry -> {
                    CostAnalysisVO.MonthlyCostVO mvo = new CostAnalysisVO.MonthlyCostVO();
                    mvo.setMonth(entry.getKey());
                    mvo.setTotalCost(entry.getValue().stream()
                            .map(ProductionCost::getTotalCost)
                            .reduce(BigDecimal.ZERO, BigDecimal::add));
                    mvo.setWorkOrderCount(entry.getValue().stream()
                            .map(ProductionCost::getWorkOrderId)
                            .distinct()
                            .count());
                    return mvo;
                })
                .sorted(Comparator.comparing(CostAnalysisVO.MonthlyCostVO::getMonth))
                .toList();
        vo.setMonthlyTrend(monthlyTrend);

        Map<String, List<ProductionCost>> categoryMap = costs.stream()
                .filter(c -> StrUtil.isNotBlank(c.getCategoryName()))
                .collect(Collectors.groupingBy(ProductionCost::getCategoryName));
        List<CostAnalysisVO.CategoryCostVO> categoryCosts = categoryMap.entrySet().stream()
                .map(entry -> {
                    CostAnalysisVO.CategoryCostVO cvo = new CostAnalysisVO.CategoryCostVO();
                    cvo.setCategoryName(entry.getKey());
                    BigDecimal catCost = entry.getValue().stream()
                            .map(ProductionCost::getTotalCost)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);
                    cvo.setTotalCost(catCost);
                    if (totalCost.compareTo(BigDecimal.ZERO) > 0) {
                        cvo.setRatio(catCost.divide(totalCost, 4, RoundingMode.HALF_UP).multiply(new BigDecimal(100)));
                    }
                    cvo.setWorkOrderCount(entry.getValue().stream()
                            .map(ProductionCost::getWorkOrderId)
                            .distinct()
                            .count());
                    return cvo;
                })
                .sorted(Comparator.comparing(CostAnalysisVO.CategoryCostVO::getTotalCost).reversed())
                .toList();
        vo.setCategoryCosts(categoryCosts);

        List<WorkOrderMaterial> allMaterials = new ArrayList<>();
        for (ProductionCost cost : costs) {
            if (cost.getWorkOrderId() != null) {
                List<WorkOrderMaterial> materials = workOrderMaterialMapper.selectList(
                        new LambdaQueryWrapper<WorkOrderMaterial>()
                                .eq(WorkOrderMaterial::getWorkOrderId, cost.getWorkOrderId())
                );
                allMaterials.addAll(materials);
            }
        }

        Map<String, List<WorkOrderMaterial>> materialMap = allMaterials.stream()
                .filter(m -> StrUtil.isNotBlank(m.getMaterialName()))
                .collect(Collectors.groupingBy(WorkOrderMaterial::getMaterialName));
        List<CostAnalysisVO.MaterialCostVO> topMaterials = materialMap.entrySet().stream()
                .map(entry -> {
                    CostAnalysisVO.MaterialCostVO mvo = new CostAnalysisVO.MaterialCostVO();
                    mvo.setMaterialName(entry.getKey());
                    BigDecimal quantity = entry.getValue().stream()
                            .map(m -> m.getActualQuantity() != null ? m.getActualQuantity() : BigDecimal.ZERO)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);
                    mvo.setTotalQuantity(quantity);
                    mvo.setTotalCost(quantity.multiply(new BigDecimal("10")));
                    if (totalCost.compareTo(BigDecimal.ZERO) > 0) {
                        mvo.setRatio(mvo.getTotalCost().divide(totalCost, 4, RoundingMode.HALF_UP).multiply(new BigDecimal(100)));
                    }
                    return mvo;
                })
                .sorted(Comparator.comparing(CostAnalysisVO.MaterialCostVO::getTotalCost).reversed())
                .limit(10)
                .toList();
        vo.setTopMaterialCosts(topMaterials);

        return vo;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void autoCalculateCosts() {
        LocalDate today = LocalDate.now();
        LocalDate yesterday = today.minusDays(1);

        List<WorkOrder> finishedOrders = workOrderMapper.selectList(
                new LambdaQueryWrapper<WorkOrder>()
                        .eq(WorkOrder::getStatus, 4)
                        .ge(WorkOrder::getActualEndTime, yesterday.atStartOfDay())
                        .lt(WorkOrder::getActualEndTime, today.atStartOfDay())
        );

        for (WorkOrder order : finishedOrders) {
            Long count = productionCostMapper.selectCount(
                    new LambdaQueryWrapper<ProductionCost>()
                            .eq(ProductionCost::getWorkOrderId, order.getId())
            );
            if (count == 0) {
                try {
                    calculateWorkOrderCost(order.getId());
                    log.info("自动核算工单成本成功，工单ID：{}", order.getId());
                } catch (Exception e) {
                    log.error("自动核算工单成本失败，工单ID：{}", order.getId(), e);
                }
            }
        }
    }
}
