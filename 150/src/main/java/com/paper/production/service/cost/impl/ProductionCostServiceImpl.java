package com.paper.production.service.cost.impl;

import cn.hutool.core.util.StrUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.paper.production.common.PageQuery;
import com.paper.production.common.PageResult;
import com.paper.production.common.ResultCode;
import com.paper.production.dto.cost.ProductionCostDTO;
import com.paper.production.entity.cost.CostDetail;
import com.paper.production.entity.cost.MonthlyReport;
import com.paper.production.entity.cost.ProductionCost;
import com.paper.production.entity.workorder.WorkOrder;
import com.paper.production.entity.workorder.WorkOrderMaterial;
import com.paper.production.enums.WorkOrderStatusEnum;
import com.paper.production.entity.quality.DefectiveProduct;
import com.paper.production.exception.BusinessException;
import com.paper.production.mapper.cost.CostDetailMapper;
import com.paper.production.mapper.quality.DefectiveProductMapper;
import com.paper.production.mapper.cost.MonthlyReportMapper;
import com.paper.production.mapper.cost.ProductionCostMapper;
import com.paper.production.mapper.workorder.WorkOrderMapper;
import com.paper.production.mapper.workorder.WorkOrderMaterialMapper;
import com.paper.production.service.cost.ProductionCostService;
import jakarta.annotation.Resource;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ProductionCostServiceImpl extends ServiceImpl<ProductionCostMapper, ProductionCost> implements ProductionCostService {

    @Resource
    private CostDetailMapper costDetailMapper;

    @Resource
    private MonthlyReportMapper monthlyReportMapper;

    @Resource
    private WorkOrderMapper workOrderMapper;

    @Resource
    private WorkOrderMaterialMapper workOrderMaterialMapper;

    @Resource
    private DefectiveProductMapper defectiveProductMapper;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void calculateCost(Long workOrderId) {
        WorkOrder workOrder = workOrderMapper.selectById(workOrderId);
        if (workOrder == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST.getCode(), "工单不存在");
        }

        if (!WorkOrderStatusEnum.FINISHED.getCode().equals(workOrder.getStatus())) {
            throw new BusinessException(ResultCode.ORDER_STATUS_ERROR.getCode(), "工单未完成，无法核算成本");
        }

        LambdaQueryWrapper<ProductionCost> costWrapper = new LambdaQueryWrapper<>();
        costWrapper.eq(ProductionCost::getWorkOrderId, workOrderId);
        if (count(costWrapper) > 0) {
            throw new BusinessException(ResultCode.DATA_ALREADY_EXIST.getCode(), "该工单已核算成本");
        }

        LambdaQueryWrapper<WorkOrderMaterial> materialWrapper = new LambdaQueryWrapper<>();
        materialWrapper.eq(WorkOrderMaterial::getWorkOrderId, workOrderId);
        List<WorkOrderMaterial> materials = workOrderMaterialMapper.selectList(materialWrapper);

        BigDecimal materialCost = BigDecimal.ZERO;
        for (WorkOrderMaterial material : materials) {
            BigDecimal actualQuantity = material.getActualQuantity().compareTo(BigDecimal.ZERO) > 0
                    ? material.getActualQuantity() : material.getPlanQuantity();
            materialCost = materialCost.add(actualQuantity.multiply(material.getUnitPrice()));
        }

        BigDecimal equipmentCost = calculateEquipmentCost(workOrder);
        BigDecimal utilityCost = calculateUtilityCost(workOrder);
        BigDecimal laborCost = calculateLaborCost(workOrder);
        BigDecimal scrapCost = calculateScrapCost(workOrder);

        BigDecimal totalCost = materialCost.add(equipmentCost).add(utilityCost).add(laborCost).add(scrapCost);
        BigDecimal unitCost = workOrder.getFinishedQuantity().compareTo(BigDecimal.ZERO) > 0
                ? totalCost.divide(workOrder.getFinishedQuantity(), 4, BigDecimal.ROUND_HALF_UP)
                : BigDecimal.ZERO;

        ProductionCost cost = new ProductionCost();
        cost.setWorkOrderId(workOrderId);
        cost.setOrderNo(workOrder.getOrderNo());
        cost.setOrderName(workOrder.getOrderName());
        cost.setMaterialCost(materialCost);
        cost.setEquipmentCost(equipmentCost);
        cost.setUtilityCost(utilityCost);
        cost.setLaborCost(laborCost);
        cost.setScrapCost(scrapCost);
        cost.setTotalCost(totalCost);
        cost.setOutputQuantity(workOrder.getFinishedQuantity());
        cost.setUnitCost(unitCost);
        cost.setCostDate(LocalDate.now());
        cost.setPeriod(LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM")));
        cost.setStatus(1);
        save(cost);

        generateCostDetails(cost.getId(), workOrderId, materials, equipmentCost, utilityCost, laborCost, scrapCost);
    }

    @Override
    public void saveCost(ProductionCostDTO dto) {
        ProductionCost cost = new ProductionCost();
        BeanUtils.copyProperties(dto, cost);
        save(cost);
    }

    @Override
    public void updateCost(ProductionCostDTO dto) {
        if (dto.getId() == null) {
            throw new BusinessException(ResultCode.PARAM_ERROR.getCode(), "ID不能为空");
        }
        ProductionCost cost = getById(dto.getId());
        if (cost == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }
        BeanUtils.copyProperties(dto, cost);
        updateById(cost);
    }

    @Override
    public void deleteCost(Long id) {
        ProductionCost cost = getById(id);
        if (cost == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }
        removeById(id);
        costDetailMapper.delete(new LambdaQueryWrapper<CostDetail>()
                .eq(CostDetail::getCostId, id));
    }

    @Override
    public PageResult<ProductionCost> queryCostPage(PageQuery query) {
        LambdaQueryWrapper<ProductionCost> wrapper = new LambdaQueryWrapper<>();
        if (StrUtil.isNotBlank(query.getKeyword())) {
            wrapper.and(w -> w.like(ProductionCost::getOrderNo, query.getKeyword())
                    .or().like(ProductionCost::getOrderName, query.getKeyword()));
        }
        wrapper.orderByDesc(ProductionCost::getCostDate);

        Page<ProductionCost> page = page(new Page<>(query.getCurrent(), query.getSize()), wrapper);
        return PageResult.of(page.getTotal(), page.getPages(), page.getCurrent(), page.getSize(), page.getRecords());
    }

    @Override
    public List<CostDetail> getCostDetails(Long costId) {
        LambdaQueryWrapper<CostDetail> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(CostDetail::getCostId, costId);
        wrapper.orderByAsc(CostDetail::getCostType);
        return costDetailMapper.selectList(wrapper);
    }

    @Override
    public List<CostDetail> getWorkOrderCostDetails(Long workOrderId) {
        LambdaQueryWrapper<CostDetail> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(CostDetail::getWorkOrderId, workOrderId);
        wrapper.orderByAsc(CostDetail::getCostType);
        return costDetailMapper.selectList(wrapper);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public MonthlyReport generateMonthlyReport(String reportMonth) {
        LambdaQueryWrapper<MonthlyReport> reportWrapper = new LambdaQueryWrapper<>();
        reportWrapper.eq(MonthlyReport::getReportMonth, reportMonth);
        MonthlyReport existingReport = monthlyReportMapper.selectOne(reportWrapper);
        if (existingReport != null) {
            monthlyReportMapper.deleteById(existingReport.getId());
        }

        LambdaQueryWrapper<ProductionCost> costWrapper = new LambdaQueryWrapper<>();
        costWrapper.eq(ProductionCost::getPeriod, reportMonth);
        List<ProductionCost> costs = list(costWrapper);

        BigDecimal totalMaterialCost = BigDecimal.ZERO;
        BigDecimal totalEquipmentCost = BigDecimal.ZERO;
        BigDecimal totalUtilityCost = BigDecimal.ZERO;
        BigDecimal totalLaborCost = BigDecimal.ZERO;
        BigDecimal totalScrapCost = BigDecimal.ZERO;
        BigDecimal totalOutputQuantity = BigDecimal.ZERO;

        for (ProductionCost cost : costs) {
            totalMaterialCost = totalMaterialCost.add(cost.getMaterialCost());
            totalEquipmentCost = totalEquipmentCost.add(cost.getEquipmentCost());
            totalUtilityCost = totalUtilityCost.add(cost.getUtilityCost());
            totalLaborCost = totalLaborCost.add(cost.getLaborCost());
            totalScrapCost = totalScrapCost.add(cost.getScrapCost());
            totalOutputQuantity = totalOutputQuantity.add(cost.getOutputQuantity());
        }

        BigDecimal totalCost = totalMaterialCost.add(totalEquipmentCost).add(totalUtilityCost)
                .add(totalLaborCost).add(totalScrapCost);

        LambdaQueryWrapper<WorkOrder> orderWrapper = new LambdaQueryWrapper<>();
        orderWrapper.like(WorkOrder::getActualEndTime, reportMonth + "-");
        Integer finishedOrderCount = Math.toIntExact(workOrderMapper.selectCount(orderWrapper));

        LambdaQueryWrapper<WorkOrder> totalOrderWrapper = new LambdaQueryWrapper<>();
        totalOrderWrapper.like(WorkOrder::getCreateTime, reportMonth + "-");
        Integer totalOrderCount = Math.toIntExact(workOrderMapper.selectCount(totalOrderWrapper));

        MonthlyReport report = new MonthlyReport();
        report.setReportMonth(reportMonth);
        report.setTotalMaterialCost(totalMaterialCost);
        report.setTotalEquipmentCost(totalEquipmentCost);
        report.setTotalUtilityCost(totalUtilityCost);
        report.setTotalLaborCost(totalLaborCost);
        report.setTotalScrapCost(totalScrapCost);
        report.setTotalCost(totalCost);
        report.setTotalOutputQuantity(totalOutputQuantity);
        report.setFinishedOrderCount(finishedOrderCount);
        report.setTotalOrderCount(totalOrderCount);
        report.setRemark("自动生成于 " + LocalDate.now());
        monthlyReportMapper.insert(report);

        return report;
    }

    @Override
    public List<MonthlyReport> getMonthlyReports() {
        LambdaQueryWrapper<MonthlyReport> wrapper = new LambdaQueryWrapper<>();
        wrapper.orderByDesc(MonthlyReport::getReportMonth);
        return monthlyReportMapper.selectList(wrapper);
    }

    @Override
    public void autoGenerateMonthlyReport() {
        YearMonth lastMonth = YearMonth.now().minusMonths(1);
        String reportMonth = lastMonth.format(DateTimeFormatter.ofPattern("yyyy-MM"));
        generateMonthlyReport(reportMonth);
    }

    private BigDecimal calculateEquipmentCost(WorkOrder workOrder) {
        if (workOrder.getQuantity() == null) {
            return BigDecimal.ZERO;
        }
        return workOrder.getQuantity().multiply(new BigDecimal("0.5"));
    }

    private BigDecimal calculateUtilityCost(WorkOrder workOrder) {
        if (workOrder.getQuantity() == null) {
            return BigDecimal.ZERO;
        }
        return workOrder.getQuantity().multiply(new BigDecimal("0.3"));
    }

    private BigDecimal calculateLaborCost(WorkOrder workOrder) {
        if (workOrder.getQuantity() == null) {
            return BigDecimal.ZERO;
        }
        return workOrder.getQuantity().multiply(new BigDecimal("1.2"));
    }

    private BigDecimal calculateScrapCost(WorkOrder workOrder) {
        if (workOrder.getDefectiveQuantity() == null) {
            return BigDecimal.ZERO;
        }
        return workOrder.getDefectiveQuantity().multiply(new BigDecimal("2.0"));
    }

    private void generateCostDetails(Long costId, Long workOrderId, List<WorkOrderMaterial> materials,
                                     BigDecimal equipmentCost, BigDecimal utilityCost,
                                     BigDecimal laborCost, BigDecimal scrapCost) {
        for (WorkOrderMaterial material : materials) {
            CostDetail detail = new CostDetail();
            detail.setCostId(costId);
            detail.setWorkOrderId(workOrderId);
            detail.setOrderNo(material.getOrderNo());
            detail.setCostType("MATERIAL");
            detail.setCostName("原材料成本");
            detail.setMaterialId(material.getMaterialId());
            detail.setMaterialCode(material.getMaterialCode());
            detail.setMaterialName(material.getMaterialName());
            detail.setSpecification(material.getSpecification());
            detail.setUnit(material.getUnit());
            BigDecimal actualQuantity = material.getActualQuantity().compareTo(BigDecimal.ZERO) > 0
                    ? material.getActualQuantity() : material.getPlanQuantity();
            detail.setQuantity(actualQuantity);
            detail.setUnitPrice(material.getUnitPrice());
            detail.setTotalPrice(actualQuantity.multiply(material.getUnitPrice()));
            detail.setRemark(material.getRemark());
            costDetailMapper.insert(detail);
        }

        CostDetail equipmentDetail = new CostDetail();
        equipmentDetail.setCostId(costId);
        equipmentDetail.setWorkOrderId(workOrderId);
        equipmentDetail.setCostType("EQUIPMENT");
        equipmentDetail.setCostName("设备损耗");
        equipmentDetail.setQuantity(BigDecimal.ONE);
        equipmentDetail.setUnitPrice(equipmentCost);
        equipmentDetail.setTotalPrice(equipmentCost);
        costDetailMapper.insert(equipmentDetail);

        CostDetail utilityDetail = new CostDetail();
        utilityDetail.setCostId(costId);
        utilityDetail.setWorkOrderId(workOrderId);
        utilityDetail.setCostType("UTILITY");
        utilityDetail.setCostName("水电能耗");
        utilityDetail.setQuantity(BigDecimal.ONE);
        utilityDetail.setUnitPrice(utilityCost);
        utilityDetail.setTotalPrice(utilityCost);
        costDetailMapper.insert(utilityDetail);

        CostDetail laborDetail = new CostDetail();
        laborDetail.setCostId(costId);
        laborDetail.setWorkOrderId(workOrderId);
        laborDetail.setCostType("LABOR");
        laborDetail.setCostName("人工工时");
        laborDetail.setQuantity(BigDecimal.ONE);
        laborDetail.setUnitPrice(laborCost);
        laborDetail.setTotalPrice(laborCost);
        costDetailMapper.insert(laborDetail);

        CostDetail scrapDetail = new CostDetail();
        scrapDetail.setCostId(costId);
        scrapDetail.setWorkOrderId(workOrderId);
        scrapDetail.setCostType("SCRAP");
        scrapDetail.setCostName("残料报废");
        scrapDetail.setQuantity(BigDecimal.ONE);
        scrapDetail.setUnitPrice(scrapCost);
        scrapDetail.setTotalPrice(scrapCost);
        costDetailMapper.insert(scrapDetail);

        List<DefectiveProduct> defectives = getDefectiveProducts(workOrderId);
        for (DefectiveProduct defective : defectives) {
            CostDetail defectiveDetail = new CostDetail();
            defectiveDetail.setCostId(costId);
            defectiveDetail.setWorkOrderId(workOrderId);
            defectiveDetail.setOrderNo(defective.getOrderNo());
            defectiveDetail.setCostType("DEFECTIVE");
            defectiveDetail.setCostName("次品损失-" + defective.getProcessName());
            defectiveDetail.setQuantity(defective.getDefectiveQuantity());
            defectiveDetail.setUnitPrice(defective.getLossAmount() != null
                    ? defective.getLossAmount().divide(defective.getDefectiveQuantity().compareTo(BigDecimal.ZERO) > 0
                    ? defective.getDefectiveQuantity() : BigDecimal.ONE, 4, RoundingMode.HALF_UP) : BigDecimal.ZERO);
            defectiveDetail.setTotalPrice(defective.getLossAmount() != null ? defective.getLossAmount() : BigDecimal.ZERO);
            defectiveDetail.setRemark("次品类型:" + defective.getDefectiveType() + ", 原因:" + defective.getDefectiveReason());
            costDetailMapper.insert(defectiveDetail);
        }
    }

    @Override
    public Map<String, Object> calculateUnitCost(Long workOrderId) {
        Map<String, Object> result = new HashMap<>();

        WorkOrder workOrder = workOrderMapper.selectById(workOrderId);
        if (workOrder == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST.getCode(), "工单不存在");
        }

        BigDecimal outputQuantity = workOrder.getFinishedQuantity() != null
                && workOrder.getFinishedQuantity().compareTo(BigDecimal.ZERO) > 0
                ? workOrder.getFinishedQuantity() : BigDecimal.ONE;

        LambdaQueryWrapper<WorkOrderMaterial> materialWrapper = new LambdaQueryWrapper<>();
        materialWrapper.eq(WorkOrderMaterial::getWorkOrderId, workOrderId);
        List<WorkOrderMaterial> materials = workOrderMaterialMapper.selectList(materialWrapper);

        BigDecimal materialCost = BigDecimal.ZERO;
        for (WorkOrderMaterial material : materials) {
            BigDecimal actualQuantity = material.getActualQuantity().compareTo(BigDecimal.ZERO) > 0
                    ? material.getActualQuantity() : material.getPlanQuantity();
            materialCost = materialCost.add(actualQuantity.multiply(material.getUnitPrice()));
        }

        BigDecimal equipmentCost = calculateEquipmentCost(workOrder);
        BigDecimal utilityCost = calculateUtilityCost(workOrder);
        BigDecimal laborCost = calculateLaborCost(workOrder);
        BigDecimal scrapCost = calculateScrapCost(workOrder);
        BigDecimal defectiveLoss = getTotalLossAmount(workOrderId);

        BigDecimal totalCost = materialCost.add(equipmentCost).add(utilityCost)
                .add(laborCost).add(scrapCost).add(defectiveLoss);

        BigDecimal unitMaterialCost = materialCost.divide(outputQuantity, 4, RoundingMode.HALF_UP);
        BigDecimal unitEquipmentCost = equipmentCost.divide(outputQuantity, 4, RoundingMode.HALF_UP);
        BigDecimal unitUtilityCost = utilityCost.divide(outputQuantity, 4, RoundingMode.HALF_UP);
        BigDecimal unitLaborCost = laborCost.divide(outputQuantity, 4, RoundingMode.HALF_UP);
        BigDecimal unitScrapCost = scrapCost.divide(outputQuantity, 4, RoundingMode.HALF_UP);
        BigDecimal unitDefectiveCost = defectiveLoss.divide(outputQuantity, 4, RoundingMode.HALF_UP);
        BigDecimal unitTotalCost = totalCost.divide(outputQuantity, 4, RoundingMode.HALF_UP);

        result.put("orderNo", workOrder.getOrderNo());
        result.put("orderName", workOrder.getOrderName());
        result.put("outputQuantity", outputQuantity);
        result.put("materialCost", materialCost);
        result.put("equipmentCost", equipmentCost);
        result.put("utilityCost", utilityCost);
        result.put("laborCost", laborCost);
        result.put("scrapCost", scrapCost);
        result.put("defectiveLoss", defectiveLoss);
        result.put("totalCost", totalCost);
        result.put("unitMaterialCost", unitMaterialCost);
        result.put("unitEquipmentCost", unitEquipmentCost);
        result.put("unitUtilityCost", unitUtilityCost);
        result.put("unitLaborCost", unitLaborCost);
        result.put("unitScrapCost", unitScrapCost);
        result.put("unitDefectiveCost", unitDefectiveCost);
        result.put("unitTotalCost", unitTotalCost);

        return result;
    }

    @Override
    public Map<String, Object> getCostComposition(Long workOrderId) {
        Map<String, Object> result = new HashMap<>();

        WorkOrder workOrder = workOrderMapper.selectById(workOrderId);
        if (workOrder == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST.getCode(), "工单不存在");
        }

        LambdaQueryWrapper<WorkOrderMaterial> materialWrapper = new LambdaQueryWrapper<>();
        materialWrapper.eq(WorkOrderMaterial::getWorkOrderId, workOrderId);
        List<WorkOrderMaterial> materials = workOrderMaterialMapper.selectList(materialWrapper);

        BigDecimal materialCost = BigDecimal.ZERO;
        for (WorkOrderMaterial material : materials) {
            BigDecimal actualQuantity = material.getActualQuantity().compareTo(BigDecimal.ZERO) > 0
                    ? material.getActualQuantity() : material.getPlanQuantity();
            materialCost = materialCost.add(actualQuantity.multiply(material.getUnitPrice()));
        }

        BigDecimal equipmentCost = calculateEquipmentCost(workOrder);
        BigDecimal utilityCost = calculateUtilityCost(workOrder);
        BigDecimal laborCost = calculateLaborCost(workOrder);
        BigDecimal scrapCost = calculateScrapCost(workOrder);
        BigDecimal defectiveLoss = getTotalLossAmount(workOrderId);

        BigDecimal totalCost = materialCost.add(equipmentCost).add(utilityCost)
                .add(laborCost).add(scrapCost).add(defectiveLoss);

        result.put("materialCost", materialCost);
        result.put("equipmentCost", equipmentCost);
        result.put("utilityCost", utilityCost);
        result.put("laborCost", laborCost);
        result.put("scrapCost", scrapCost);
        result.put("defectiveLoss", defectiveLoss);
        result.put("totalCost", totalCost);

        if (totalCost.compareTo(BigDecimal.ZERO) > 0) {
            result.put("materialRatio", materialCost.divide(totalCost, 4, RoundingMode.HALF_UP)
                    .multiply(new BigDecimal("100")));
            result.put("equipmentRatio", equipmentCost.divide(totalCost, 4, RoundingMode.HALF_UP)
                    .multiply(new BigDecimal("100")));
            result.put("utilityRatio", utilityCost.divide(totalCost, 4, RoundingMode.HALF_UP)
                    .multiply(new BigDecimal("100")));
            result.put("laborRatio", laborCost.divide(totalCost, 4, RoundingMode.HALF_UP)
                    .multiply(new BigDecimal("100")));
            result.put("scrapRatio", scrapCost.divide(totalCost, 4, RoundingMode.HALF_UP)
                    .multiply(new BigDecimal("100")));
            result.put("defectiveRatio", defectiveLoss.divide(totalCost, 4, RoundingMode.HALF_UP)
                    .multiply(new BigDecimal("100")));
        }

        return result;
    }

    @Override
    public BigDecimal getTotalLossAmount(Long workOrderId) {
        List<DefectiveProduct> defectives = getDefectiveProducts(workOrderId);
        BigDecimal totalLoss = BigDecimal.ZERO;
        for (DefectiveProduct defective : defectives) {
            if (defective.getLossAmount() != null) {
                totalLoss = totalLoss.add(defective.getLossAmount());
            }
        }
        return totalLoss;
    }

    @Override
    public Map<String, Object> getDefectiveCost(Long workOrderId) {
        Map<String, Object> result = new HashMap<>();

        List<DefectiveProduct> defectives = getDefectiveProducts(workOrderId);

        BigDecimal totalLoss = BigDecimal.ZERO;
        BigDecimal totalHandleCost = BigDecimal.ZERO;
        BigDecimal totalScrapValue = BigDecimal.ZERO;
        BigDecimal totalDefectiveQuantity = BigDecimal.ZERO;

        Map<String, BigDecimal> processLoss = new HashMap<>();
        Map<String, BigDecimal> typeLoss = new HashMap<>();

        for (DefectiveProduct defective : defectives) {
            if (defective.getLossAmount() != null) {
                totalLoss = totalLoss.add(defective.getLossAmount());
            }
            if (defective.getHandleCost() != null) {
                totalHandleCost = totalHandleCost.add(defective.getHandleCost());
            }
            if (defective.getScrapValue() != null) {
                totalScrapValue = totalScrapValue.add(defective.getScrapValue());
            }
            if (defective.getDefectiveQuantity() != null) {
                totalDefectiveQuantity = totalDefectiveQuantity.add(defective.getDefectiveQuantity());
            }

            String process = defective.getProcessName() != null ? defective.getProcessName() : "未知工序";
            processLoss.merge(process, defective.getLossAmount() != null ? defective.getLossAmount() : BigDecimal.ZERO, BigDecimal::add);

            String type = defective.getDefectiveType() != null ? defective.getDefectiveType() : "其他";
            typeLoss.merge(type, defective.getLossAmount() != null ? defective.getLossAmount() : BigDecimal.ZERO, BigDecimal::add);
        }

        result.put("defectiveCount", defectives.size());
        result.put("totalDefectiveQuantity", totalDefectiveQuantity);
        result.put("totalLossAmount", totalLoss);
        result.put("totalHandleCost", totalHandleCost);
        result.put("totalScrapValue", totalScrapValue);
        result.put("processLoss", processLoss);
        result.put("typeLoss", typeLoss);

        return result;
    }

    private List<DefectiveProduct> getDefectiveProducts(Long workOrderId) {
        LambdaQueryWrapper<DefectiveProduct> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(DefectiveProduct::getWorkOrderId, workOrderId);
        return defectiveProductMapper.selectList(wrapper);
    }
}
