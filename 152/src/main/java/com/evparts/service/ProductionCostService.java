package com.evparts.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.evparts.common.PageResult;
import com.evparts.common.ResultCode;
import com.evparts.dto.CostDetailDTO;
import com.evparts.dto.ProductionCostDTO;
import com.evparts.entity.*;
import com.evparts.exception.BusinessException;
import com.evparts.mapper.*;
import com.evparts.utils.CodeGenerator;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ProductionCostService {

    @Autowired
    private ProductionCostMapper productionCostMapper;

    @Autowired
    private CostDetailMapper costDetailMapper;

    @Autowired
    private WorkOrderMapper workOrderMapper;

    @Autowired
    private WorkOrderMaterialMapper workOrderMaterialMapper;

    @Autowired
    private ProductMapper productMapper;

    @Autowired
    private CodeGenerator codeGenerator;

    @Autowired
    private WorkOrderProcessMapper processMapper;

    public PageResult<ProductionCost> getDetailPage(Integer pageNum, Integer pageSize,
                                                    String costNo, String orderNo,
                                                    String productName, Long categoryId,
                                                    Integer status, String startDate, String endDate) {
        Page<ProductionCost> page = new Page<>(pageNum, pageSize);
        IPage<ProductionCost> resultPage = productionCostMapper.getCostDetailPage(
                page, costNo, orderNo, productName, categoryId, status, startDate, endDate
        );
        return PageResult.of(resultPage);
    }

    public PageResult<ProductionCost> getPage(Integer pageNum, Integer pageSize, String costNo,
                                              Long workOrderId, Integer status,
                                              LocalDate startDate, LocalDate endDate) {
        return getDetailPage(
                pageNum, pageSize, costNo, null, null, null, status,
                startDate != null ? startDate.toString() : null,
                endDate != null ? endDate.toString() : null
        );
    }

    public ProductionCost getById(Long id) {
        ProductionCost cost = productionCostMapper.selectById(id);
        if (cost == null) {
            throw new BusinessException(ResultCode.COST_NOT_EXIST);
        }

        WorkOrder workOrder = workOrderMapper.selectById(cost.getWorkOrderId());
        if (workOrder != null) {
            cost.setOrderNo(workOrder.getOrderNo());
        }
        Product product = productMapper.selectById(cost.getProductId());
        if (product != null) {
            cost.setProductName(product.getProductName());
            cost.setProductCode(product.getProductCode());
        }

        List<CostDetail> details = costDetailMapper.selectList(
                new LambdaQueryWrapper<CostDetail>()
                        .eq(CostDetail::getProductionCostId, id)
        );
        cost.setCostDetails(details);

        return cost;
    }

    @Transactional(rollbackFor = Exception.class)
    public Long autoCalculate(Long workOrderId) {
        WorkOrder workOrder = workOrderMapper.selectById(workOrderId);
        if (workOrder == null) {
            throw new BusinessException(ResultCode.WORK_ORDER_NOT_EXIST);
        }
        if (!"COMPLETED".equals(workOrder.getOrderStatus())) {
            throw new BusinessException("工单未完成，无法核算成本");
        }

        Long existingCount = productionCostMapper.selectCount(
                new LambdaQueryWrapper<ProductionCost>()
                        .eq(ProductionCost::getWorkOrderId, workOrderId)
        );
        if (existingCount > 0) {
            throw new BusinessException("该工单已存在成本记录");
        }

        List<WorkOrderProcess> processes = workOrderMapper.getWorkOrderProcesses(workOrderId);
        List<WorkOrderMaterial> materials = workOrderMapper.getWorkOrderMaterials(workOrderId);
        BigDecimal totalMaterialCost = materials.stream()
                .map(m -> m.getTotalPrice() != null ? m.getTotalPrice() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalLossCost = calculateLossCost(workOrderId, processes, materials);
        BigDecimal laborCost = calculateLaborCost(workOrder, processes);
        BigDecimal energyCost = calculateEnergyCost(workOrder, processes);
        BigDecimal scrapCost = calculateScrapCost(workOrder, materials);
        BigDecimal moldCost = calculateMoldCost(workOrder, processes);

        ProductionCost cost = new ProductionCost();
        cost.setCostNo(codeGenerator.generateCostNo());
        cost.setWorkOrderId(workOrderId);
        cost.setProductId(workOrder.getProductId());
        cost.setTotalMaterialCost(totalMaterialCost.add(totalLossCost));
        cost.setTotalMoldCost(moldCost);
        cost.setTotalEnergyCost(energyCost);
        cost.setTotalLaborCost(laborCost);
        cost.setTotalScrapCost(scrapCost);

        BigDecimal totalCost = totalMaterialCost
                .add(totalLossCost)
                .add(moldCost)
                .add(energyCost)
                .add(laborCost)
                .add(scrapCost);
        cost.setTotalCost(totalCost);

        if (workOrder.getActualQuantity() != null && workOrder.getActualQuantity() > 0) {
            cost.setUnitCost(totalCost.divide(new BigDecimal(workOrder.getActualQuantity()), 2, BigDecimal.ROUND_HALF_UP));
        } else {
            cost.setUnitCost(BigDecimal.ZERO);
        }

        cost.setCostDate(LocalDate.now());
        cost.setStatus(0);
        cost.setRemark("系统自动核算（含工序损耗归集）");
        productionCostMapper.insert(cost);

        for (WorkOrderMaterial material : materials) {
            if (material.getTotalPrice() != null && material.getTotalPrice().compareTo(BigDecimal.ZERO) > 0) {
                CostDetail detail = new CostDetail();
                detail.setProductionCostId(cost.getId());
                detail.setCostType("MATERIAL");
                detail.setItemName(material.getMaterialName() != null ? material.getMaterialName() : "原料成本");
                detail.setQuantity(material.getActualQuantity());
                detail.setUnitPrice(material.getUnitPrice());
                detail.setTotalPrice(material.getTotalPrice());
                costDetailMapper.insert(detail);
            }
        }

        for (WorkOrderProcess process : processes) {
            if (process.getMaterialLoss() != null && process.getMaterialLoss().compareTo(BigDecimal.ZERO) > 0) {
                CostDetail detail = new CostDetail();
                detail.setProductionCostId(cost.getId());
                detail.setCostType("MATERIAL");
                detail.setLossType("NORMAL");
                detail.setItemName(process.getProcessName() + "原料损耗");
                detail.setQuantity(process.getMaterialLoss());
                detail.setTotalPrice(process.getMaterialLoss().multiply(new BigDecimal("5")));
                costDetailMapper.insert(detail);
            }
        }

        if (laborCost.compareTo(BigDecimal.ZERO) > 0) {
            CostDetail detail = new CostDetail();
            detail.setProductionCostId(cost.getId());
            detail.setCostType("LABOR");
            detail.setItemName("人工工时成本");
            detail.setTotalPrice(laborCost);
            costDetailMapper.insert(detail);
        }

        if (energyCost.compareTo(BigDecimal.ZERO) > 0) {
            CostDetail detail = new CostDetail();
            detail.setProductionCostId(cost.getId());
            detail.setCostType("ENERGY");
            detail.setItemName("设备能耗成本");
            detail.setTotalPrice(energyCost);
            costDetailMapper.insert(detail);
        }

        if (moldCost.compareTo(BigDecimal.ZERO) > 0) {
            CostDetail detail = new CostDetail();
            detail.setProductionCostId(cost.getId());
            detail.setCostType("MOLD");
            detail.setItemName("模具损耗成本");
            detail.setTotalPrice(moldCost);
            costDetailMapper.insert(detail);
        }

        if (scrapCost.compareTo(BigDecimal.ZERO) > 0) {
            CostDetail detail = new CostDetail();
            detail.setProductionCostId(cost.getId());
            detail.setCostType("SCRAP");
            detail.setLossType("ABNORMAL");
            detail.setItemName("不良品报废成本");
            detail.setTotalPrice(scrapCost);
            costDetailMapper.insert(detail);
        }

        return cost.getId();
    }

    private BigDecimal calculateLossCost(Long workOrderId, List<WorkOrderProcess> processes, List<WorkOrderMaterial> materials) {
        if (materials == null || materials.isEmpty()) {
            return BigDecimal.ZERO;
        }
        BigDecimal totalLoss = BigDecimal.ZERO;
        for (WorkOrderProcess process : processes) {
            if (process.getMaterialLoss() != null && process.getMaterialLoss().compareTo(BigDecimal.ZERO) > 0) {
                totalLoss = totalLoss.add(process.getMaterialLoss().multiply(new BigDecimal("5")));
            }
        }
        return totalLoss;
    }

    private BigDecimal calculateLaborCost(WorkOrder workOrder, List<WorkOrderProcess> processes) {
        if (workOrder.getActualQuantity() == null || workOrder.getActualQuantity() == 0) {
            return BigDecimal.ZERO;
        }

        BigDecimal totalActualHours = BigDecimal.ZERO;
        for (WorkOrderProcess process : processes) {
            if (process.getLaborHours() != null) {
                totalActualHours = totalActualHours.add(process.getLaborHours());
            }
        }

        if (totalActualHours.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal hourlyRate = new BigDecimal("50");
            return totalActualHours.multiply(hourlyRate);
        }

        Product product = productMapper.selectById(workOrder.getProductId());
        if (product == null || product.getStandardTime() == null) {
            return BigDecimal.ZERO;
        }
        BigDecimal hourlyRate = new BigDecimal("50");
        BigDecimal totalHours = new BigDecimal(product.getStandardTime())
                .multiply(new BigDecimal(workOrder.getActualQuantity()))
                .divide(new BigDecimal("60"), 2, BigDecimal.ROUND_HALF_UP);
        return totalHours.multiply(hourlyRate);
    }

    private BigDecimal calculateEnergyCost(WorkOrder workOrder, List<WorkOrderProcess> processes) {
        if (workOrder.getActualQuantity() == null || workOrder.getActualQuantity() == 0) {
            return BigDecimal.ZERO;
        }

        BigDecimal totalEnergy = BigDecimal.ZERO;
        for (WorkOrderProcess process : processes) {
            if (process.getEnergyConsumption() != null) {
                totalEnergy = totalEnergy.add(process.getEnergyConsumption());
            }
        }

        if (totalEnergy.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal unitPrice = new BigDecimal("1.5");
            return totalEnergy.multiply(unitPrice);
        }

        BigDecimal energyPerUnit = new BigDecimal("5");
        return new BigDecimal(workOrder.getActualQuantity()).multiply(energyPerUnit);
    }

    private BigDecimal calculateMoldCost(WorkOrder workOrder, List<WorkOrderProcess> processes) {
        int stampingCount = 0;
        for (WorkOrderProcess process : processes) {
            if ("STAMPING".equals(process.getProcessCode()) && "COMPLETED".equals(process.getProcessStatus())) {
                stampingCount = process.getQualifiedQuantity() != null ? process.getQualifiedQuantity() : 0;
            }
        }
        if (stampingCount == 0) {
            stampingCount = workOrder.getActualQuantity() != null ? workOrder.getActualQuantity() : 0;
        }
        BigDecimal moldCostPerUnit = new BigDecimal("2");
        return new BigDecimal(stampingCount).multiply(moldCostPerUnit);
    }

    private BigDecimal calculateScrapCost(WorkOrder workOrder, List<WorkOrderMaterial> materials) {
        if (workOrder.getBadQuantity() == null || workOrder.getBadQuantity() == 0) {
            return BigDecimal.ZERO;
        }
        BigDecimal totalMaterialCost = materials.stream()
                .map(m -> m.getTotalPrice() != null ? m.getTotalPrice() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        int totalQty = (workOrder.getActualQuantity() != null ? workOrder.getActualQuantity() : 0)
                + (workOrder.getBadQuantity() != null ? workOrder.getBadQuantity() : 0);
        if (totalQty == 0) {
            return BigDecimal.ZERO;
        }
        BigDecimal unitMaterialCost = totalMaterialCost.divide(new BigDecimal(totalQty), 2, BigDecimal.ROUND_HALF_UP);
        return unitMaterialCost.multiply(new BigDecimal(workOrder.getBadQuantity()));
    }

    @Transactional(rollbackFor = Exception.class)
    public Long create(ProductionCostDTO dto) {
        WorkOrder workOrder = workOrderMapper.selectById(dto.getWorkOrderId());
        if (workOrder == null) {
            throw new BusinessException(ResultCode.WORK_ORDER_NOT_EXIST);
        }
        if (!"COMPLETED".equals(workOrder.getOrderStatus())) {
            throw new BusinessException("工单未完成，无法核算成本");
        }

        Long existingCount = productionCostMapper.selectCount(
                new LambdaQueryWrapper<ProductionCost>()
                        .eq(ProductionCost::getWorkOrderId, dto.getWorkOrderId())
        );
        if (existingCount > 0) {
            throw new BusinessException("该工单已存在成本记录");
        }

        List<WorkOrderMaterial> materials = workOrderMaterialMapper.selectList(
                new LambdaQueryWrapper<WorkOrderMaterial>()
                        .eq(WorkOrderMaterial::getWorkOrderId, dto.getWorkOrderId())
        );
        BigDecimal totalMaterialCost = materials.stream()
                .map(m -> m.getTotalPrice() != null ? m.getTotalPrice() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        ProductionCost cost = new ProductionCost();
        cost.setCostNo(codeGenerator.generateCostNo());
        cost.setWorkOrderId(dto.getWorkOrderId());
        cost.setProductId(workOrder.getProductId());
        cost.setTotalMaterialCost(totalMaterialCost);
        cost.setTotalMoldCost(dto.getTotalMoldCost() != null ? dto.getTotalMoldCost() : BigDecimal.ZERO);
        cost.setTotalEnergyCost(dto.getTotalEnergyCost() != null ? dto.getTotalEnergyCost() : BigDecimal.ZERO);
        cost.setTotalLaborCost(dto.getTotalLaborCost() != null ? dto.getTotalLaborCost() : BigDecimal.ZERO);
        cost.setTotalScrapCost(dto.getTotalScrapCost() != null ? dto.getTotalScrapCost() : BigDecimal.ZERO);

        BigDecimal totalCost = totalMaterialCost
                .add(cost.getTotalMoldCost())
                .add(cost.getTotalEnergyCost())
                .add(cost.getTotalLaborCost())
                .add(cost.getTotalScrapCost());
        cost.setTotalCost(totalCost);

        if (workOrder.getActualQuantity() != null && workOrder.getActualQuantity() > 0) {
            cost.setUnitCost(totalCost.divide(new BigDecimal(workOrder.getActualQuantity()), 2, BigDecimal.ROUND_HALF_UP));
        } else {
            cost.setUnitCost(BigDecimal.ZERO);
        }

        cost.setCostDate(dto.getCostDate());
        cost.setStatus(0);
        cost.setRemark(dto.getRemark());
        productionCostMapper.insert(cost);

        for (WorkOrderMaterial material : materials) {
            if (material.getTotalPrice() != null && material.getTotalPrice().compareTo(BigDecimal.ZERO) > 0) {
                CostDetail detail = new CostDetail();
                detail.setProductionCostId(cost.getId());
                detail.setCostType("MATERIAL");
                detail.setItemName(material.getMaterialName() != null ? material.getMaterialName() : "原料成本");
                detail.setQuantity(material.getActualQuantity());
                detail.setUnitPrice(material.getUnitPrice());
                detail.setTotalPrice(material.getTotalPrice());
                costDetailMapper.insert(detail);
            }
        }

        if (dto.getCostDetails() != null) {
            for (CostDetailDTO detailDTO : dto.getCostDetails()) {
                CostDetail detail = new CostDetail();
                BeanUtils.copyProperties(detailDTO, detail);
                detail.setProductionCostId(cost.getId());
                costDetailMapper.insert(detail);
            }
        }

        return cost.getId();
    }

    @Transactional(rollbackFor = Exception.class)
    public void confirm(Long id) {
        ProductionCost cost = productionCostMapper.selectById(id);
        if (cost == null) {
            throw new BusinessException(ResultCode.COST_NOT_EXIST);
        }
        if (cost.getStatus() != 0) {
            throw new BusinessException(ResultCode.COST_STATUS_ERROR);
        }
        cost.setStatus(1);
        productionCostMapper.updateById(cost);
    }

    @Transactional(rollbackFor = Exception.class)
    public void reconcile(Long id) {
        ProductionCost cost = productionCostMapper.selectById(id);
        if (cost == null) {
            throw new BusinessException(ResultCode.COST_NOT_EXIST);
        }
        if (cost.getStatus() != 1) {
            throw new BusinessException(ResultCode.COST_STATUS_ERROR);
        }
        cost.setStatus(2);
        productionCostMapper.updateById(cost);
    }

    public List<Map<String, Object>> getCostAnalysis(String startDate, String endDate, Long productId) {
        return productionCostMapper.getCostAnalysis(startDate, endDate, productId);
    }

    public List<Map<String, Object>> getCostByProduct(String startDate, String endDate) {
        return productionCostMapper.getCostByProduct(startDate, endDate);
    }

    public List<ProductionCost> getReport(LocalDate startDate, LocalDate endDate, Long productId) {
        LambdaQueryWrapper<ProductionCost> wrapper = new LambdaQueryWrapper<>();
        if (startDate != null) {
            wrapper.ge(ProductionCost::getCostDate, startDate);
        }
        if (endDate != null) {
            wrapper.le(ProductionCost::getCostDate, endDate);
        }
        if (productId != null) {
            wrapper.eq(ProductionCost::getProductId, productId);
        }
        wrapper.and(w -> w.eq(ProductionCost::getStatus, 1).or().eq(ProductionCost::getStatus, 2));
        wrapper.orderByAsc(ProductionCost::getCostDate);

        List<ProductionCost> costs = productionCostMapper.selectList(wrapper);
        for (ProductionCost cost : costs) {
            WorkOrder workOrder = workOrderMapper.selectById(cost.getWorkOrderId());
            if (workOrder != null) {
                cost.setOrderNo(workOrder.getOrderNo());
            }
            Product product = productMapper.selectById(cost.getProductId());
            if (product != null) {
                cost.setProductName(product.getProductName());
                cost.setProductCode(product.getProductCode());
            }
        }
        return costs;
    }

    public Map<String, Object> getCostSummary(String startDate, String endDate) {
        List<Map<String, Object>> analysis = productionCostMapper.getCostAnalysis(startDate, endDate, null);

        Map<String, Object> summary = new HashMap<>();
        BigDecimal totalCost = BigDecimal.ZERO;
        BigDecimal totalMaterialCost = BigDecimal.ZERO;
        BigDecimal totalLaborCost = BigDecimal.ZERO;
        BigDecimal totalEnergyCost = BigDecimal.ZERO;
        BigDecimal totalScrapCost = BigDecimal.ZERO;
        BigDecimal totalMoldCost = BigDecimal.ZERO;
        int totalCostCount = 0;
        int totalOutput = 0;

        for (Map<String, Object> item : analysis) {
            totalCost = totalCost.add((BigDecimal) item.getOrDefault("total_cost", BigDecimal.ZERO));
            totalMaterialCost = totalMaterialCost.add((BigDecimal) item.getOrDefault("total_material_cost", BigDecimal.ZERO));
            totalLaborCost = totalLaborCost.add((BigDecimal) item.getOrDefault("total_labor_cost", BigDecimal.ZERO));
            totalEnergyCost = totalEnergyCost.add((BigDecimal) item.getOrDefault("total_energy_cost", BigDecimal.ZERO));
            totalScrapCost = totalScrapCost.add((BigDecimal) item.getOrDefault("total_scrap_cost", BigDecimal.ZERO));
            totalMoldCost = totalMoldCost.add((BigDecimal) item.getOrDefault("total_mold_cost", BigDecimal.ZERO));
            totalCostCount += ((Long) item.getOrDefault("cost_count", 0L)).intValue();
            totalOutput += ((Long) item.getOrDefault("total_output", 0L)).intValue();
        }

        summary.put("totalCost", totalCost);
        summary.put("totalMaterialCost", totalMaterialCost);
        summary.put("totalLaborCost", totalLaborCost);
        summary.put("totalEnergyCost", totalEnergyCost);
        summary.put("totalScrapCost", totalScrapCost);
        summary.put("totalMoldCost", totalMoldCost);
        summary.put("totalCostCount", totalCostCount);
        summary.put("totalOutput", totalOutput);

        if (totalOutput > 0) {
            summary.put("avgUnitCost", totalCost.divide(new BigDecimal(totalOutput), 2, BigDecimal.ROUND_HALF_UP));
        } else {
            summary.put("avgUnitCost", BigDecimal.ZERO);
        }

        Map<String, BigDecimal> costStructure = new HashMap<>();
        if (totalCost.compareTo(BigDecimal.ZERO) > 0) {
            costStructure.put("material", totalMaterialCost.multiply(new BigDecimal("100")).divide(totalCost, 2, BigDecimal.ROUND_HALF_UP));
            costStructure.put("labor", totalLaborCost.multiply(new BigDecimal("100")).divide(totalCost, 2, BigDecimal.ROUND_HALF_UP));
            costStructure.put("energy", totalEnergyCost.multiply(new BigDecimal("100")).divide(totalCost, 2, BigDecimal.ROUND_HALF_UP));
            costStructure.put("scrap", totalScrapCost.multiply(new BigDecimal("100")).divide(totalCost, 2, BigDecimal.ROUND_HALF_UP));
            costStructure.put("mold", totalMoldCost.multiply(new BigDecimal("100")).divide(totalCost, 2, BigDecimal.ROUND_HALF_UP));
        }
        summary.put("costStructure", costStructure);

        return summary;
    }

}
