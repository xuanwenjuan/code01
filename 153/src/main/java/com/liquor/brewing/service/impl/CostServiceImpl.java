package com.liquor.brewing.service.impl;

import cn.hutool.core.date.DateUtil;
import cn.hutool.core.util.StrUtil;
import com.alibaba.excel.EasyExcel;
import com.alibaba.excel.annotation.ExcelProperty;
import com.alibaba.excel.annotation.write.style.ColumnWidth;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.liquor.brewing.common.Constants;
import com.liquor.brewing.common.PageQuery;
import com.liquor.brewing.common.ResultCode;
import com.liquor.brewing.entity.CostStatistics;
import com.liquor.brewing.entity.WorkOrder;
import com.liquor.brewing.entity.WorkOrderCost;
import com.liquor.brewing.entity.WorkOrderMaterial;
import com.liquor.brewing.entity.WorkOrderProcess;
import com.liquor.brewing.exception.BusinessException;
import com.liquor.brewing.mapper.CostStatisticsMapper;
import com.liquor.brewing.mapper.WorkOrderCostMapper;
import com.liquor.brewing.mapper.WorkOrderMapper;
import com.liquor.brewing.mapper.WorkOrderMaterialMapper;
import com.liquor.brewing.mapper.WorkOrderProcessMapper;
import com.liquor.brewing.service.CostService;
import jakarta.annotation.Resource;
import jakarta.servlet.http.HttpServletResponse;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
public class CostServiceImpl extends ServiceImpl<WorkOrderCostMapper, WorkOrderCost> implements CostService {

    @Resource
    private WorkOrderMapper workOrderMapper;

    @Resource
    private WorkOrderMaterialMapper workOrderMaterialMapper;

    @Resource
    private WorkOrderProcessMapper workOrderProcessMapper;

    @Resource
    private CostStatisticsMapper costStatisticsMapper;

    @Value("${liquor.cost.equipment-base:500}")
    private BigDecimal equipmentBaseCost;

    @Value("${liquor.cost.utility-base:300}")
    private BigDecimal utilityBaseCost;

    @Value("${liquor.cost.labor-base:800}")
    private BigDecimal laborBaseCost;

    @Override
    public IPage<WorkOrderCost> costPage(String month, PageQuery pageQuery) {
        LambdaQueryWrapper<WorkOrderCost> wrapper = new LambdaQueryWrapper<>();
        if (StrUtil.isNotBlank(month)) {
            wrapper.apply("DATE_FORMAT(create_time, '%Y-%m') = {0}", month);
        }
        wrapper.orderByDesc(WorkOrderCost::getCreateTime);
        return baseMapper.selectCostPage(new Page<>(pageQuery.getPageNum(), pageQuery.getPageSize()), wrapper);
    }

    @Override
    public IPage<CostStatistics> statisticsPage(PageQuery pageQuery) {
        return costStatisticsMapper.selectPage(new Page<>(pageQuery.getPageNum(), pageQuery.getPageSize()),
                new LambdaQueryWrapper<CostStatistics>().orderByDesc(CostStatistics::getStatisticsMonth));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public WorkOrderCost calculateWorkOrderCost(Long workOrderId) {
        WorkOrder workOrder = workOrderMapper.selectById(workOrderId);
        if (workOrder == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }
        if (!Constants.WorkOrderStatus.FINISHED.equals(workOrder.getStatus())) {
            throw new BusinessException("工单未完成，无法核算成本");
        }

        List<WorkOrderMaterial> materials = workOrderMaterialMapper.selectList(
                new LambdaQueryWrapper<WorkOrderMaterial>().eq(WorkOrderMaterial::getWorkOrderId, workOrderId));

        BigDecimal materialCost = BigDecimal.ZERO;
        BigDecimal scrapCost = BigDecimal.ZERO;
        for (WorkOrderMaterial material : materials) {
            if (material.getActualQuantity() != null && material.getUnitPrice() != null) {
                BigDecimal total = material.getActualQuantity().multiply(material.getUnitPrice());
                material.setTotalPrice(total);
                materialCost = materialCost.add(total);

                if (material.getPlanQuantity() != null && material.getActualQuantity().compareTo(material.getPlanQuantity()) > 0) {
                    BigDecimal scrapQuantity = material.getActualQuantity().subtract(material.getPlanQuantity());
                    scrapCost = scrapCost.add(scrapQuantity.multiply(material.getUnitPrice()));
                }
            }
        }

        List<WorkOrderProcess> processes = workOrderProcessMapper.selectList(
                new LambdaQueryWrapper<WorkOrderProcess>().eq(WorkOrderProcess::getWorkOrderId, workOrderId));

        int totalDuration = 0;
        for (WorkOrderProcess process : processes) {
            if (process.getDuration() != null) {
                totalDuration += process.getDuration();
            }
        }

        BigDecimal equipmentCost = calculateEquipmentCost(workOrder, totalDuration);
        BigDecimal utilityCost = calculateUtilityCost(workOrder, totalDuration);
        BigDecimal laborCost = calculateLaborCost(workOrder, totalDuration);

        BigDecimal totalCost = materialCost.add(equipmentCost)
                .add(utilityCost).add(laborCost).add(scrapCost);

        BigDecimal outputQuantity = workOrder.getActualQuantity() != null ? workOrder.getActualQuantity() : BigDecimal.ZERO;
        BigDecimal unitCost = outputQuantity.compareTo(BigDecimal.ZERO) > 0
                ? totalCost.divide(outputQuantity, 4, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        WorkOrderCost exist = getOne(new LambdaQueryWrapper<WorkOrderCost>().eq(WorkOrderCost::getWorkOrderId, workOrderId));
        WorkOrderCost workOrderCost = exist != null ? exist : new WorkOrderCost();
        workOrderCost.setWorkOrderId(workOrderId);
        workOrderCost.setMaterialCost(materialCost);
        workOrderCost.setEquipmentCost(equipmentCost);
        workOrderCost.setUtilityCost(utilityCost);
        workOrderCost.setLaborCost(laborCost);
        workOrderCost.setScrapCost(scrapCost);
        workOrderCost.setTotalCost(totalCost);
        workOrderCost.setOutputQuantity(outputQuantity);
        workOrderCost.setUnitCost(unitCost);

        if (exist != null) {
            updateById(workOrderCost);
        } else {
            save(workOrderCost);
        }

        return workOrderCost;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void generateMonthlyStatistics() {
        YearMonth lastMonth = YearMonth.now().minusMonths(1);
        String month = lastMonth.format(DateTimeFormatter.ofPattern("yyyy-MM"));

        LocalDateTime start = lastMonth.atDay(1).atStartOfDay();
        LocalDateTime end = lastMonth.atEndOfMonth().atTime(23, 59, 59);

        List<WorkOrder> finishedOrders = workOrderMapper.selectList(new LambdaQueryWrapper<WorkOrder>()
                .eq(WorkOrder::getStatus, Constants.WorkOrderStatus.FINISHED)
                .ge(WorkOrder::getActualEndTime, start)
                .le(WorkOrder::getActualEndTime, end));

        if (finishedOrders.isEmpty()) {
            return;
        }

        List<Long> orderIds = finishedOrders.stream().map(WorkOrder::getId).toList();
        List<WorkOrderCost> costs = list(new LambdaQueryWrapper<WorkOrderCost>().in(WorkOrderCost::getWorkOrderId, orderIds));

        CostStatistics statistics = new CostStatistics();
        statistics.setStatisticsMonth(month);
        statistics.setWorkOrderCount(finishedOrders.size());

        BigDecimal totalOutput = BigDecimal.ZERO;
        for (WorkOrder order : finishedOrders) {
            if (order.getActualQuantity() != null) {
                totalOutput = totalOutput.add(order.getActualQuantity());
            }
        }
        statistics.setTotalOutput(totalOutput);

        for (WorkOrderCost cost : costs) {
            statistics.setMaterialCost(statistics.getMaterialCost() != null
                    ? statistics.getMaterialCost().add(cost.getMaterialCost() != null ? cost.getMaterialCost() : BigDecimal.ZERO)
                    : cost.getMaterialCost());
            statistics.setEquipmentCost(statistics.getEquipmentCost() != null
                    ? statistics.getEquipmentCost().add(cost.getEquipmentCost() != null ? cost.getEquipmentCost() : BigDecimal.ZERO)
                    : cost.getEquipmentCost());
            statistics.setUtilityCost(statistics.getUtilityCost() != null
                    ? statistics.getUtilityCost().add(cost.getUtilityCost() != null ? cost.getUtilityCost() : BigDecimal.ZERO)
                    : cost.getUtilityCost());
            statistics.setLaborCost(statistics.getLaborCost() != null
                    ? statistics.getLaborCost().add(cost.getLaborCost() != null ? cost.getLaborCost() : BigDecimal.ZERO)
                    : cost.getLaborCost());
            statistics.setScrapCost(statistics.getScrapCost() != null
                    ? statistics.getScrapCost().add(cost.getScrapCost() != null ? cost.getScrapCost() : BigDecimal.ZERO)
                    : cost.getScrapCost());
        }

        BigDecimal totalCost = (statistics.getMaterialCost() != null ? statistics.getMaterialCost() : BigDecimal.ZERO)
                .add(statistics.getEquipmentCost() != null ? statistics.getEquipmentCost() : BigDecimal.ZERO)
                .add(statistics.getUtilityCost() != null ? statistics.getUtilityCost() : BigDecimal.ZERO)
                .add(statistics.getLaborCost() != null ? statistics.getLaborCost() : BigDecimal.ZERO)
                .add(statistics.getScrapCost() != null ? statistics.getScrapCost() : BigDecimal.ZERO);
        statistics.setTotalCost(totalCost);
        statistics.setUnitCost(totalOutput.compareTo(BigDecimal.ZERO) > 0
                ? totalCost.divide(totalOutput, 4, RoundingMode.HALF_UP)
                : BigDecimal.ZERO);

        CostStatistics exist = costStatisticsMapper.selectOne(new LambdaQueryWrapper<CostStatistics>()
                .eq(CostStatistics::getStatisticsMonth, month));
        if (exist != null) {
            statistics.setId(exist.getId());
            costStatisticsMapper.updateById(statistics);
        } else {
            costStatisticsMapper.insert(statistics);
        }
    }

    @Override
    public List<WorkOrderMaterial> exportWorkOrderMaterials(Long workOrderId) {
        return workOrderMaterialMapper.selectList(new LambdaQueryWrapper<WorkOrderMaterial>()
                .eq(WorkOrderMaterial::getWorkOrderId, workOrderId));
    }

    @Override
    public void exportWorkOrderMaterialsToExcel(Long workOrderId, HttpServletResponse response) {
        List<WorkOrderMaterial> materials = exportWorkOrderMaterials(workOrderId);
        WorkOrder workOrder = workOrderMapper.selectById(workOrderId);

        List<MaterialExportVO> exportList = new ArrayList<>();
        for (WorkOrderMaterial material : materials) {
            MaterialExportVO vo = new MaterialExportVO();
            vo.setMaterialName(material.getMaterialName());
            vo.setMaterialCode(material.getMaterialCode());
            vo.setPlanQuantity(material.getPlanQuantity());
            vo.setActualQuantity(material.getActualQuantity());
            vo.setUnit(material.getUnit());
            vo.setUnitPrice(material.getUnitPrice());
            vo.setTotalPrice(material.getTotalPrice());
            vo.setBatchCode(material.getBatchCode());
            exportList.add(vo);
        }

        String fileName = "工单用料明细_" + (workOrder != null ? workOrder.getOrderNo() : workOrderId) + "_" + DateUtil.format(new java.util.Date(), "yyyyMMddHHmmss") + ".xlsx";
        try {
            response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            response.setCharacterEncoding("utf-8");
            response.setHeader("Content-disposition", "attachment;filename*=utf-8''" + URLEncoder.encode(fileName, StandardCharsets.UTF_8));
            EasyExcel.write(response.getOutputStream(), MaterialExportVO.class)
                    .sheet("用料明细")
                    .doWrite(exportList);
        } catch (IOException e) {
            throw new BusinessException("导出失败：" + e.getMessage());
        }
    }

    private BigDecimal calculateEquipmentCost(WorkOrder workOrder, int totalDurationMinutes) {
        BigDecimal durationHours = BigDecimal.valueOf(totalDurationMinutes)
                .divide(BigDecimal.valueOf(60), 2, RoundingMode.HALF_UP);
        return equipmentBaseCost.multiply(durationHours.compareTo(BigDecimal.ZERO) > 0 ? durationHours : BigDecimal.ONE);
    }

    private BigDecimal calculateUtilityCost(WorkOrder workOrder, int totalDurationMinutes) {
        BigDecimal durationHours = BigDecimal.valueOf(totalDurationMinutes)
                .divide(BigDecimal.valueOf(60), 2, RoundingMode.HALF_UP);
        return utilityBaseCost.multiply(durationHours.compareTo(BigDecimal.ZERO) > 0 ? durationHours : BigDecimal.ONE);
    }

    private BigDecimal calculateLaborCost(WorkOrder workOrder, int totalDurationMinutes) {
        BigDecimal durationHours = BigDecimal.valueOf(totalDurationMinutes)
                .divide(BigDecimal.valueOf(60), 2, RoundingMode.HALF_UP);
        return laborBaseCost.multiply(durationHours.compareTo(BigDecimal.ZERO) > 0 ? durationHours : BigDecimal.ONE);
    }

    private BigDecimal calculateScrapCost(WorkOrder workOrder) {
        return BigDecimal.ZERO;
    }

    @Data
    public static class MaterialExportVO {
        @ExcelProperty("物料名称")
        @ColumnWidth(20)
        private String materialName;

        @ExcelProperty("物料编码")
        @ColumnWidth(20)
        private String materialCode;

        @ExcelProperty("计划用量")
        @ColumnWidth(15)
        private BigDecimal planQuantity;

        @ExcelProperty("实际用量")
        @ColumnWidth(15)
        private BigDecimal actualQuantity;

        @ExcelProperty("单位")
        @ColumnWidth(10)
        private String unit;

        @ExcelProperty("单价")
        @ColumnWidth(15)
        private BigDecimal unitPrice;

        @ExcelProperty("总价")
        @ColumnWidth(15)
        private BigDecimal totalPrice;

        @ExcelProperty("批次号")
        @ColumnWidth(25)
        private String batchCode;
    }
}
