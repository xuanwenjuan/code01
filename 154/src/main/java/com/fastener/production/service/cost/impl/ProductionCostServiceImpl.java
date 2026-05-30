package com.fastener.production.service.cost.impl;

import cn.hutool.core.date.DateUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.fastener.production.common.entity.PageQuery;
import com.fastener.production.common.enums.CostTypeEnum;
import com.fastener.production.common.enums.WorkOrderStatusEnum;
import com.fastener.production.common.exception.BusinessException;
import com.fastener.production.common.result.ResultCode;
import com.fastener.production.common.utils.UserContext;
import com.fastener.production.entity.cost.MonthlyProductionReport;
import com.fastener.production.entity.cost.ProductionCost;
import com.fastener.production.entity.cost.dto.CostSummaryDTO;
import com.fastener.production.entity.cost.dto.ProductionCostDTO;
import com.fastener.production.entity.cost.vo.CategoryCostVO;
import com.fastener.production.entity.cost.vo.WorkOrderCostVO;
import com.fastener.production.entity.material.MaterialBatch;
import com.fastener.production.entity.product.ProductCategory;
import com.fastener.production.entity.workorder.ColdHeadingWorkOrder;
import com.fastener.production.entity.workorder.WorkOrderProcess;
import com.fastener.production.mapper.cost.MonthlyProductionReportMapper;
import com.fastener.production.mapper.cost.ProductionCostMapper;
import com.fastener.production.mapper.material.MaterialBatchMapper;
import com.fastener.production.mapper.product.ProductCategoryMapper;
import com.fastener.production.mapper.workorder.ColdHeadingWorkOrderMapper;
import com.fastener.production.mapper.workorder.WorkOrderProcessMapper;
import com.fastener.production.service.cost.ProductionCostService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductionCostServiceImpl extends ServiceImpl<ProductionCostMapper, ProductionCost> implements ProductionCostService {

    private final ProductionCostMapper productionCostMapper;
    private final MonthlyProductionReportMapper reportMapper;
    private final ColdHeadingWorkOrderMapper workOrderMapper;
    private final ProductCategoryMapper categoryMapper;
    private final WorkOrderProcessMapper processMapper;
    private final MaterialBatchMapper materialBatchMapper;

    @Override
    public IPage<ProductionCost> page(PageQuery pageQuery, Integer costType, Long workOrderId, String costDateStart, String costDateEnd) {
        Page<ProductionCost> page = new Page<>(pageQuery.getPageNum(), pageQuery.getPageSize());
        LambdaQueryWrapper<ProductionCost> wrapper = new LambdaQueryWrapper<>();
        if (costType != null) {
            wrapper.eq(ProductionCost::getCostType, costType);
        }
        if (workOrderId != null) {
            wrapper.eq(ProductionCost::getWorkOrderId, workOrderId);
        }
        if (costDateStart != null && !costDateStart.isEmpty()) {
            wrapper.ge(ProductionCost::getCostDate, LocalDate.parse(costDateStart));
        }
        if (costDateEnd != null && !costDateEnd.isEmpty()) {
            wrapper.le(ProductionCost::getCostDate, LocalDate.parse(costDateEnd));
        }
        wrapper.orderByDesc(ProductionCost::getCostDate);
        wrapper.orderByDesc(ProductionCost::getCreateTime);
        return this.page(page, wrapper);
    }

    @Override
    public String generateCostNo() {
        String dateStr = DateUtil.format(LocalDate.now(), "yyyyMMdd");
        String prefix = "COST" + dateStr;

        Long count = this.count(new LambdaQueryWrapper<ProductionCost>()
                .like(ProductionCost::getCostNo, prefix));

        return prefix + String.format("%04d", count + 1);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void add(ProductionCostDTO dto) {
        String costNo = generateCostNo();

        ProductionCost cost = new ProductionCost();
        BeanUtils.copyProperties(dto, cost);
        cost.setCostNo(costNo);

        if (dto.getWorkOrderId() != null) {
            ColdHeadingWorkOrder order = workOrderMapper.selectById(dto.getWorkOrderId());
            if (order != null) {
                cost.setOrderNo(order.getOrderNo());
                cost.setCategoryId(order.getCategoryId());
                cost.setCategoryName(order.getCategoryName());
            }
        } else if (dto.getCategoryId() != null) {
            ProductCategory category = categoryMapper.selectById(dto.getCategoryId());
            if (category != null) {
                cost.setCategoryName(category.getCategoryName());
            }
        }

        if (dto.getCostDate() == null) {
            cost.setCostDate(LocalDate.now());
        }

        if (dto.getOperator() == null || dto.getOperator().isEmpty()) {
            cost.setOperator(UserContext.getUsername());
        }

        if (dto.getQuantity() != null && dto.getUnitPrice() != null) {
            cost.setAmount(dto.getQuantity().multiply(dto.getUnitPrice()));
        }

        this.save(cost);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void update(ProductionCostDTO dto) {
        ProductionCost cost = this.getById(dto.getId());
        if (cost == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }

        BeanUtils.copyProperties(dto, cost);

        if (dto.getQuantity() != null && dto.getUnitPrice() != null) {
            cost.setAmount(dto.getQuantity().multiply(dto.getUnitPrice()));
        }

        this.updateById(cost);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        ProductionCost cost = this.getById(id);
        if (cost == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }
        this.removeById(id);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public WorkOrderCostVO calculateWorkOrderCost(Long workOrderId) {
        ColdHeadingWorkOrder order = workOrderMapper.selectById(workOrderId);
        if (order == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST, "工单不存在");
        }

        WorkOrderCostVO vo = new WorkOrderCostVO();
        vo.setWorkOrderId(order.getId());
        vo.setOrderNo(order.getOrderNo());
        vo.setCategoryName(order.getCategoryName());
        vo.setSpecification(order.getSpecification());
        vo.setPlanQuantity(order.getPlanQuantity());
        vo.setActualQuantity(order.getActualQuantity() != null ? order.getActualQuantity() : 0);
        vo.setScrapQuantity(order.getScrapQuantity() != null ? order.getScrapQuantity() : 0);

        int totalOutput = vo.getActualQuantity() + vo.getScrapQuantity();
        if (totalOutput > 0) {
            vo.setScrapRate(BigDecimal.valueOf(vo.getScrapQuantity())
                    .multiply(BigDecimal.valueOf(100))
                    .divide(BigDecimal.valueOf(totalOutput), 2, RoundingMode.HALF_UP));
        } else {
            vo.setScrapRate(BigDecimal.ZERO);
        }

        List<ProductionCost> costs = this.list(new LambdaQueryWrapper<ProductionCost>()
                .eq(ProductionCost::getWorkOrderId, workOrderId));

        BigDecimal materialCost = BigDecimal.ZERO;
        BigDecimal moldCost = BigDecimal.ZERO;
        BigDecimal electricityCost = BigDecimal.ZERO;
        BigDecimal laborCost = BigDecimal.ZERO;
        BigDecimal scrapCost = BigDecimal.ZERO;

        for (ProductionCost cost : costs) {
            BigDecimal amount = cost.getAmount() != null ? cost.getAmount() : BigDecimal.ZERO;
            if (CostTypeEnum.MATERIAL.getCode().equals(cost.getCostType())) {
                materialCost = materialCost.add(amount);
            } else if (CostTypeEnum.MOLD.getCode().equals(cost.getCostType())) {
                moldCost = moldCost.add(amount);
            } else if (CostTypeEnum.ELECTRICITY.getCode().equals(cost.getCostType())) {
                electricityCost = electricityCost.add(amount);
            } else if (CostTypeEnum.LABOR.getCode().equals(cost.getCostType())) {
                laborCost = laborCost.add(amount);
            } else if (CostTypeEnum.SCRAP.getCode().equals(cost.getCostType())) {
                scrapCost = scrapCost.add(amount);
            }
        }

        if (order.getMaterialId() != null && order.getMaterialUsage() != null && order.getMaterialUsage().compareTo(BigDecimal.ZERO) > 0) {
            List<MaterialBatch> batches = materialBatchMapper.selectList(new LambdaQueryWrapper<MaterialBatch>()
                    .eq(MaterialBatch::getMaterialId, order.getMaterialId())
                    .orderByAsc(MaterialBatch::getInboundTime));
            BigDecimal totalMaterialValue = batches.stream()
                    .filter(b -> b.getTotalAmount() != null && b.getQuantity() != null && b.getQuantity().compareTo(BigDecimal.ZERO) > 0)
                    .findFirst()
                    .map(b -> order.getMaterialUsage().multiply(b.getTotalAmount().divide(b.getQuantity(), 4, RoundingMode.HALF_UP)))
                    .orElse(BigDecimal.ZERO);
            if (materialCost.compareTo(BigDecimal.ZERO) == 0) {
                materialCost = totalMaterialValue;
            }
        }

        List<WorkOrderProcess> processes = processMapper.selectByWorkOrderId(workOrderId);
        BigDecimal totalWorkingHours = processes.stream()
                .filter(p -> p.getProcessDuration() != null)
                .map(WorkOrderProcess::getProcessDuration)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        vo.setTotalWorkingHours(totalWorkingHours);

        vo.setMaterialCost(materialCost);
        vo.setMoldCost(moldCost);
        vo.setElectricityCost(electricityCost);
        vo.setLaborCost(laborCost);
        vo.setScrapCost(scrapCost);

        BigDecimal totalCost = materialCost.add(moldCost).add(electricityCost).add(laborCost).add(scrapCost);
        vo.setTotalCost(totalCost);

        if (vo.getActualQuantity() > 0) {
            vo.setUnitCost(totalCost.divide(BigDecimal.valueOf(vo.getActualQuantity()), 4, RoundingMode.HALF_UP));
        } else {
            vo.setUnitCost(BigDecimal.ZERO);
        }

        if (totalWorkingHours.compareTo(BigDecimal.ZERO) > 0) {
            vo.setEfficiency(BigDecimal.valueOf(vo.getActualQuantity())
                    .divide(totalWorkingHours, 2, RoundingMode.HALF_UP));
        } else {
            vo.setEfficiency(BigDecimal.ZERO);
        }

        return vo;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public List<WorkOrderCostVO> calculateWorkOrderCostList(CostSummaryDTO dto) {
        LambdaQueryWrapper<ColdHeadingWorkOrder> wrapper = new LambdaQueryWrapper<>();

        if (dto.getStartDate() != null && !dto.getStartDate().isEmpty()) {
            wrapper.ge(ColdHeadingWorkOrder::getCreateTime, LocalDate.parse(dto.getStartDate()).atStartOfDay());
        }
        if (dto.getEndDate() != null && !dto.getEndDate().isEmpty()) {
            wrapper.le(ColdHeadingWorkOrder::getCreateTime, LocalDate.parse(dto.getEndDate()).atTime(23, 59, 59));
        }
        if (dto.getCategoryId() != null) {
            wrapper.eq(ColdHeadingWorkOrder::getCategoryId, dto.getCategoryId());
        }
        if (dto.getWorkOrderId() != null) {
            wrapper.eq(ColdHeadingWorkOrder::getId, dto.getWorkOrderId());
        }
        wrapper.orderByDesc(ColdHeadingWorkOrder::getCreateTime);

        List<ColdHeadingWorkOrder> orders = workOrderMapper.selectList(wrapper);
        List<WorkOrderCostVO> result = new ArrayList<>();

        for (ColdHeadingWorkOrder order : orders) {
            try {
                WorkOrderCostVO vo = calculateWorkOrderCost(order.getId());
                result.add(vo);
            } catch (Exception e) {
                // 跳过计算失败的工单
            }
        }

        return result;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public List<CategoryCostVO> calculateCategoryCost(CostSummaryDTO dto) {
        List<WorkOrderCostVO> workOrderCosts = calculateWorkOrderCostList(dto);

        Map<Long, List<WorkOrderCostVO>> groupedByCategory = workOrderCosts.stream()
                .filter(vo -> vo.getWorkOrderId() != null)
                .collect(Collectors.groupingBy(vo -> {
                    ColdHeadingWorkOrder order = workOrderMapper.selectById(vo.getWorkOrderId());
                    return order != null ? order.getCategoryId() : -1L;
                }));

        List<CategoryCostVO> result = new ArrayList<>();

        for (Map.Entry<Long, List<WorkOrderCostVO>> entry : groupedByCategory.entrySet()) {
            Long categoryId = entry.getKey();
            if (categoryId == -1) continue;

            ProductCategory category = categoryMapper.selectById(categoryId);
            if (category == null) continue;

            List<WorkOrderCostVO> vos = entry.getValue();
            CategoryCostVO vo = new CategoryCostVO();
            vo.setCategoryId(categoryId);
            vo.setCategoryName(category.getCategoryName());
            vo.setSpecification(category.getSpecification());

            vo.setTotalQuantity(vos.stream().mapToInt(WorkOrderCostVO::getActualQuantity).sum());
            vo.setTotalScrap(vos.stream().mapToInt(WorkOrderCostVO::getScrapQuantity).sum());

            int totalOutput = vo.getTotalQuantity() + vo.getTotalScrap();
            if (totalOutput > 0) {
                vo.setScrapRate(BigDecimal.valueOf(vo.getTotalScrap())
                        .multiply(BigDecimal.valueOf(100))
                        .divide(BigDecimal.valueOf(totalOutput), 2, RoundingMode.HALF_UP));
            } else {
                vo.setScrapRate(BigDecimal.ZERO);
            }

            vo.setTotalMaterialCost(vos.stream().map(WorkOrderCostVO::getMaterialCost).reduce(BigDecimal.ZERO, BigDecimal::add));
            vo.setTotalMoldCost(vos.stream().map(WorkOrderCostVO::getMoldCost).reduce(BigDecimal.ZERO, BigDecimal::add));
            vo.setTotalElectricityCost(vos.stream().map(WorkOrderCostVO::getElectricityCost).reduce(BigDecimal.ZERO, BigDecimal::add));
            vo.setTotalLaborCost(vos.stream().map(WorkOrderCostVO::getLaborCost).reduce(BigDecimal.ZERO, BigDecimal::add));
            vo.setTotalScrapCost(vos.stream().map(WorkOrderCostVO::getScrapCost).reduce(BigDecimal.ZERO, BigDecimal::add));

            BigDecimal totalCost = vo.getTotalMaterialCost()
                    .add(vo.getTotalMoldCost())
                    .add(vo.getTotalElectricityCost())
                    .add(vo.getTotalLaborCost())
                    .add(vo.getTotalScrapCost());
            vo.setTotalCost(totalCost);

            if (vo.getTotalQuantity() > 0) {
                vo.setUnitCost(totalCost.divide(BigDecimal.valueOf(vo.getTotalQuantity()), 4, RoundingMode.HALF_UP));
            } else {
                vo.setUnitCost(BigDecimal.ZERO);
            }

            result.add(vo);
        }

        result.sort(Comparator.comparing(CategoryCostVO::getTotalCost).reversed());
        return result;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void autoRecordWorkOrderCost(Long workOrderId) {
        ColdHeadingWorkOrder order = workOrderMapper.selectById(workOrderId);
        if (order == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST, "工单不存在");
        }
        if (!WorkOrderStatusEnum.FINISHED.getCode().equals(order.getStatus())) {
            throw new BusinessException(ResultCode.OPERATION_NOT_ALLOWED, "工单未完成，无法自动核算成本");
        }

        WorkOrderCostVO costVO = calculateWorkOrderCost(workOrderId);

        if (costVO.getMaterialCost().compareTo(BigDecimal.ZERO) > 0) {
            ProductionCost materialCost = new ProductionCost();
            materialCost.setCostNo(generateCostNo());
            materialCost.setCostType(CostTypeEnum.MATERIAL.getCode());
            materialCost.setWorkOrderId(workOrderId);
            materialCost.setOrderNo(order.getOrderNo());
            materialCost.setCategoryId(order.getCategoryId());
            materialCost.setCategoryName(order.getCategoryName());
            materialCost.setAmount(costVO.getMaterialCost());
            materialCost.setQuantity(order.getMaterialUsage());
            materialCost.setCostDate(order.getActualEndTime() != null ?
                    LocalDate.from(order.getActualEndTime()) : LocalDate.now());
            materialCost.setOperator("系统自动核算");
            materialCost.setRemark("工单完成自动核算原料成本");
            this.save(materialCost);
        }

        List<WorkOrderProcess> processes = processMapper.selectByWorkOrderId(workOrderId);
        BigDecimal totalHours = processes.stream()
                .filter(p -> p.getProcessDuration() != null)
                .map(WorkOrderProcess::getProcessDuration)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (totalHours.compareTo(BigDecimal.ZERO) > 0) {
            ProductionCost laborCost = new ProductionCost();
            laborCost.setCostNo(generateCostNo());
            laborCost.setCostType(CostTypeEnum.LABOR.getCode());
            laborCost.setWorkOrderId(workOrderId);
            laborCost.setOrderNo(order.getOrderNo());
            laborCost.setCategoryId(order.getCategoryId());
            laborCost.setCategoryName(order.getCategoryName());
            laborCost.setQuantity(totalHours);
            laborCost.setUnitPrice(BigDecimal.valueOf(50));
            laborCost.setAmount(totalHours.multiply(BigDecimal.valueOf(50)));
            laborCost.setCostDate(order.getActualEndTime() != null ?
                    LocalDate.from(order.getActualEndTime()) : LocalDate.now());
            laborCost.setOperator("系统自动核算");
            laborCost.setRemark("工单完成自动核算人工成本");
            this.save(laborCost);
        }

        if (costVO.getScrapQuantity() > 0 && order.getMaterialUsage() != null && order.getMaterialUsage().compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal scrapRate = BigDecimal.valueOf(costVO.getScrapQuantity())
                    .divide(BigDecimal.valueOf(costVO.getActualQuantity() + costVO.getScrapQuantity()), 4, RoundingMode.HALF_UP);
            BigDecimal scrapMaterialCost = costVO.getMaterialCost().multiply(scrapRate);

            if (scrapMaterialCost.compareTo(BigDecimal.ZERO) > 0) {
                ProductionCost scrapCost = new ProductionCost();
                scrapCost.setCostNo(generateCostNo());
                scrapCost.setCostType(CostTypeEnum.SCRAP.getCode());
                scrapCost.setWorkOrderId(workOrderId);
                scrapCost.setOrderNo(order.getOrderNo());
                scrapCost.setCategoryId(order.getCategoryId());
                scrapCost.setCategoryName(order.getCategoryName());
                scrapCost.setAmount(scrapMaterialCost);
                scrapCost.setQuantity(BigDecimal.valueOf(costVO.getScrapQuantity()));
                scrapCost.setCostDate(order.getActualEndTime() != null ?
                        LocalDate.from(order.getActualEndTime()) : LocalDate.now());
                scrapCost.setOperator("系统自动核算");
                scrapCost.setRemark("工单完成自动核算报废损耗");
                this.save(scrapCost);
            }
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public MonthlyProductionReport generateMonthlyReport(String reportMonth) {
        YearMonth ym = YearMonth.parse(reportMonth);
        LocalDate firstDay = ym.atDay(1);
        LocalDate lastDay = ym.atEndOfMonth();

        LambdaQueryWrapper<ColdHeadingWorkOrder> orderWrapper = new LambdaQueryWrapper<>();
        orderWrapper.ge(ColdHeadingWorkOrder::getCreateTime, firstDay.atStartOfDay());
        orderWrapper.le(ColdHeadingWorkOrder::getCreateTime, lastDay.atTime(23, 59, 59));
        List<ColdHeadingWorkOrder> orders = workOrderMapper.selectList(orderWrapper);

        int totalOrders = orders.size();
        int completedOrders = 0;
        int totalQuantity = 0;
        int totalScrapQuantity = 0;
        BigDecimal totalWorkingHours = BigDecimal.ZERO;

        for (ColdHeadingWorkOrder order : orders) {
            if (order.getStatus() != null && order.getStatus().equals(WorkOrderStatusEnum.FINISHED.getCode())) {
                completedOrders++;
            }
            totalQuantity += order.getActualQuantity() != null ? order.getActualQuantity() : 0;
            totalScrapQuantity += order.getScrapQuantity() != null ? order.getScrapQuantity() : 0;

            List<WorkOrderProcess> processes = processMapper.selectByWorkOrderId(order.getId());
            for (WorkOrderProcess process : processes) {
                if (process.getProcessDuration() != null) {
                    totalWorkingHours = totalWorkingHours.add(process.getProcessDuration());
                }
            }
        }

        BigDecimal totalMaterialCost = productionCostMapper.sumAmountByTypeAndMonth(CostTypeEnum.MATERIAL.getCode(), reportMonth);
        BigDecimal totalMoldCost = productionCostMapper.sumAmountByTypeAndMonth(CostTypeEnum.MOLD.getCode(), reportMonth);
        BigDecimal totalElectricityCost = productionCostMapper.sumAmountByTypeAndMonth(CostTypeEnum.ELECTRICITY.getCode(), reportMonth);
        BigDecimal totalLaborCost = productionCostMapper.sumAmountByTypeAndMonth(CostTypeEnum.LABOR.getCode(), reportMonth);
        BigDecimal totalScrapCost = productionCostMapper.sumAmountByTypeAndMonth(CostTypeEnum.SCRAP.getCode(), reportMonth);

        if (totalMaterialCost == null) totalMaterialCost = BigDecimal.ZERO;
        if (totalMoldCost == null) totalMoldCost = BigDecimal.ZERO;
        if (totalElectricityCost == null) totalElectricityCost = BigDecimal.ZERO;
        if (totalLaborCost == null) totalLaborCost = BigDecimal.ZERO;
        if (totalScrapCost == null) totalScrapCost = BigDecimal.ZERO;

        BigDecimal totalCost = totalMaterialCost.add(totalMoldCost).add(totalElectricityCost).add(totalLaborCost).add(totalScrapCost);

        MonthlyProductionReport report = reportMapper.selectByMonth(reportMonth);
        if (report == null) {
            report = new MonthlyProductionReport();
            report.setReportMonth(reportMonth);
        }

        report.setTotalOrders(totalOrders);
        report.setCompletedOrders(completedOrders);
        report.setTotalQuantity(totalQuantity);
        report.setTotalScrapQuantity(totalScrapQuantity);

        if (totalQuantity + totalScrapQuantity > 0) {
            report.setScrapRate(BigDecimal.valueOf(totalScrapQuantity)
                    .multiply(BigDecimal.valueOf(100))
                    .divide(BigDecimal.valueOf(totalQuantity + totalScrapQuantity), 2, RoundingMode.HALF_UP));
        } else {
            report.setScrapRate(BigDecimal.ZERO);
        }

        report.setTotalMaterialCost(totalMaterialCost);
        report.setTotalMoldCost(totalMoldCost);
        report.setTotalElectricityCost(totalElectricityCost);
        report.setTotalLaborCost(totalLaborCost);
        report.setTotalScrapCost(totalScrapCost);
        report.setTotalCost(totalCost);

        if (totalQuantity > 0) {
            report.setUnitCost(totalCost.divide(BigDecimal.valueOf(totalQuantity), 4, RoundingMode.HALF_UP));
        } else {
            report.setUnitCost(BigDecimal.ZERO);
        }

        report.setTotalWorkingHours(totalWorkingHours);

        if (totalWorkingHours.compareTo(BigDecimal.ZERO) > 0) {
            report.setEfficiency(BigDecimal.valueOf(totalQuantity)
                    .divide(totalWorkingHours, 2, RoundingMode.HALF_UP));
        } else {
            report.setEfficiency(BigDecimal.ZERO);
        }

        if (report.getId() == null) {
            reportMapper.insert(report);
        } else {
            reportMapper.updateById(report);
        }

        return report;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void recalculateReport(String reportMonth) {
        MonthlyProductionReport existing = reportMapper.selectByMonth(reportMonth);
        if (existing != null) {
            reportMapper.deleteById(existing.getId());
        }
        generateMonthlyReport(reportMonth);
    }

    @Override
    public List<MonthlyProductionReport> getReportList(String startMonth, String endMonth) {
        LambdaQueryWrapper<MonthlyProductionReport> wrapper = new LambdaQueryWrapper<>();
        if (startMonth != null && !startMonth.isEmpty()) {
            wrapper.ge(MonthlyProductionReport::getReportMonth, startMonth);
        }
        if (endMonth != null && !endMonth.isEmpty()) {
            wrapper.le(MonthlyProductionReport::getReportMonth, endMonth);
        }
        wrapper.orderByDesc(MonthlyProductionReport::getReportMonth);
        return reportMapper.selectList(wrapper);
    }

    @Override
    public MonthlyProductionReport getReportByMonth(String reportMonth) {
        return reportMapper.selectByMonth(reportMonth);
    }
}
