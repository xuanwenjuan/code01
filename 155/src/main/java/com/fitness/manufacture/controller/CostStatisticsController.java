package com.fitness.manufacture.controller;

import com.alibaba.excel.EasyExcel;
import com.alibaba.excel.annotation.ExcelProperty;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.fitness.manufacture.common.PageQuery;
import com.fitness.manufacture.common.Result;
import com.fitness.manufacture.dto.CostStatisticsQueryDTO;
import com.fitness.manufacture.entity.CostStatistics;
import com.fitness.manufacture.service.CostStatisticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletResponse;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.List;

@Tag(name = "成本统计管理")
@RestController
@RequestMapping("/api/cost-statistics")
@RequiredArgsConstructor
public class CostStatisticsController {

    private final CostStatisticsService costStatisticsService;

    @Operation(summary = "计算工单成本")
    @PostMapping("/calculate/{workOrderId}")
    public Result<Void> calculateWorkOrderCost(@PathVariable Long workOrderId) {
        costStatisticsService.calculateWorkOrderCost(workOrderId);
        return Result.success();
    }

    @Operation(summary = "获取成本统计分页列表")
    @GetMapping("/page")
    public Result<IPage<CostStatistics>> getCostStatisticsPage(PageQuery query,
                                                               @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
                                                               @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate,
                                                               @RequestParam(required = false) Long productId) {
        return Result.success(costStatisticsService.getCostStatisticsPage(query, startDate, endDate, productId));
    }

    @Operation(summary = "获取成本统计列表")
    @GetMapping("/list")
    public Result<List<CostStatistics>> getCostStatisticsList(@RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
                                                               @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate,
                                                               @RequestParam(required = false) Long productId) {
        return Result.success(costStatisticsService.getCostStatisticsList(startDate, endDate, productId));
    }

    @Operation(summary = "导出成本统计")
    @GetMapping("/export")
    public void exportCostStatistics(HttpServletResponse response,
                                     @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
                                     @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate,
                                     @RequestParam(required = false) Long productId) throws IOException {
        List<CostStatistics> list = costStatisticsService.getCostStatisticsList(startDate, endDate, productId);
        List<CostStatisticsExcelVO> data = list.stream().map(this::convertToExcelVO).toList();

        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        response.setCharacterEncoding("utf-8");
        String fileName = URLEncoder.encode("成本统计报表", StandardCharsets.UTF_8).replaceAll("\\+", "%20");
        response.setHeader("Content-disposition", "attachment;filename*=utf-8''" + fileName + ".xlsx");

        EasyExcel.write(response.getOutputStream(), CostStatisticsExcelVO.class)
                .sheet("成本统计")
                .doWrite(data);
    }

    @Operation(summary = "多条件组合分页查询成本统计")
    @PostMapping("/search")
    public Result<IPage<CostStatistics>> searchCostStatistics(@RequestBody CostStatisticsQueryDTO queryDTO) {
        return Result.success(costStatisticsService.getCostStatisticsPageByConditions(queryDTO));
    }

    private CostStatisticsExcelVO convertToExcelVO(CostStatistics statistics) {
        CostStatisticsExcelVO vo = new CostStatisticsExcelVO();
        vo.setWorkOrderNo(statistics.getWorkOrderNo());
        vo.setProductName(statistics.getProductName());
        vo.setPlanQuantity(statistics.getPlanQuantity());
        vo.setActualQuantity(statistics.getActualQuantity());
        vo.setQualifiedQuantity(statistics.getQualifiedQuantity());
        vo.setPassRate(statistics.getPassRate());
        vo.setMetalMaterialCost(statistics.getMetalMaterialCost());
        vo.setPlasticMaterialCost(statistics.getPlasticMaterialCost());
        vo.setElectronicMaterialCost(statistics.getElectronicMaterialCost());
        vo.setAuxiliaryMaterialCost(statistics.getAuxiliaryMaterialCost());
        vo.setMaterialCost(statistics.getMaterialCost());
        vo.setWeldingCost(statistics.getWeldingCost());
        vo.setLaborCost(statistics.getLaborCost());
        vo.setEquipmentCost(statistics.getEquipmentCost());
        vo.setScrapCost(statistics.getScrapCost());
        vo.setTotalCost(statistics.getTotalCost());
        vo.setUnitCost(statistics.getUnitCost());
        vo.setStartDate(statistics.getStartDate());
        vo.setEndDate(statistics.getEndDate());
        vo.setStatisticsDate(statistics.getStatisticsDate());
        return vo;
    }

    @Data
    public static class CostStatisticsExcelVO {
        @ExcelProperty("工单编号")
        private String workOrderNo;
        @ExcelProperty("产品名称")
        private String productName;
        @ExcelProperty("计划数量")
        private Integer planQuantity;
        @ExcelProperty("实际数量")
        private Integer actualQuantity;
        @ExcelProperty("合格数量")
        private Integer qualifiedQuantity;
        @ExcelProperty("合格率")
        private BigDecimal passRate;
        @ExcelProperty("金属材料成本")
        private BigDecimal metalMaterialCost;
        @ExcelProperty("塑料材料成本")
        private BigDecimal plasticMaterialCost;
        @ExcelProperty("电子材料成本")
        private BigDecimal electronicMaterialCost;
        @ExcelProperty("辅助材料成本")
        private BigDecimal auxiliaryMaterialCost;
        @ExcelProperty("材料总成本")
        private BigDecimal materialCost;
        @ExcelProperty("焊接耗材成本")
        private BigDecimal weldingCost;
        @ExcelProperty("人工成本")
        private BigDecimal laborCost;
        @ExcelProperty("设备能耗成本")
        private BigDecimal equipmentCost;
        @ExcelProperty("报废损耗成本")
        private BigDecimal scrapCost;
        @ExcelProperty("总成本")
        private BigDecimal totalCost;
        @ExcelProperty("单位成本")
        private BigDecimal unitCost;
        @ExcelProperty("开始日期")
        private LocalDate startDate;
        @ExcelProperty("结束日期")
        private LocalDate endDate;
        @ExcelProperty("统计日期")
        private LocalDate statisticsDate;
    }
}
