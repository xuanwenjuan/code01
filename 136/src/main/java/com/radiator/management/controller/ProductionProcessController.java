package com.radiator.management.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.radiator.management.annotation.RequiresRole;
import com.radiator.management.common.Result;
import com.radiator.management.constant.RoleConstants;
import com.radiator.management.entity.*;
import com.radiator.management.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/production-process")
public class ProductionProcessController {

    @Autowired
    private ProductionWorkOrderService workOrderService;

    @Autowired
    private ProductBomService bomService;

    @Autowired
    private ProductBomDetailService bomDetailService;

    @Autowired
    private StockOutService stockOutService;

    @Autowired
    private StockOutDetailService stockOutDetailService;

    @Autowired
    private ProductionReportService productionReportService;

    @Autowired
    private QualityInspectionService qualityInspectionService;

    @Autowired
    private QualityInspectionDetailService qualityInspectionDetailService;

    @Autowired
    private FinishedStockService finishedStockService;

    @Autowired
    private MaterialInventoryService materialInventoryService;

    @Autowired
    private WorkOrderMaterialService workOrderMaterialService;

    @PostMapping("/pick-materials/{workOrderId}")
    @RequiresRole({RoleConstants.PRODUCTION_LEADER, RoleConstants.WAREHOUSE_MANAGER})
    @Transactional(rollbackFor = Exception.class)
    public Result pickMaterials(@PathVariable Long workOrderId,
                                @RequestParam Long warehouseId,
                                @RequestParam Long locationId,
                                @RequestAttribute Long userId) {
        ProductionWorkOrder workOrder = workOrderService.getById(workOrderId);
        if (workOrder == null) {
            return Result.error("工单不存在");
        }
        if (!"PENDING".equals(workOrder.getStatus())) {
            return Result.error("工单状态不允许领料");
        }

        ProductBom bom = bomService.getOne(
                new LambdaQueryWrapper<ProductBom>().eq(ProductBom::getCategoryId, workOrder.getCategoryId())
        );
        if (bom == null) {
            return Result.error("产品BOM未配置");
        }

        List<ProductBomDetail> bomDetails = bomDetailService.list(
                new LambdaQueryWrapper<ProductBomDetail>().eq(ProductBomDetail::getBomId, bom.getId())
        );
        if (bomDetails.isEmpty()) {
            return Result.error("BOM明细为空");
        }

        for (ProductBomDetail detail : bomDetails) {
            BigDecimal requiredQty = detail.getQuantity().multiply(BigDecimal.valueOf(workOrder.getQuantity()));
            MaterialInventory inventory = materialInventoryService.getById(detail.getMaterialId());
            if (inventory == null || inventory.getQuantity().compareTo(requiredQty) < 0) {
                return Result.error("物料库存不足: " + detail.getMaterialName());
            }
        }

        String orderNo = "SO" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        StockOutOrder stockOutOrder = new StockOutOrder();
        stockOutOrder.setOrderNo(orderNo);
        stockOutOrder.setOrderType("PRODUCTION_PICK");
        stockOutOrder.setWarehouseId(warehouseId);
        stockOutOrder.setLocationId(locationId);
        stockOutOrder.setWorkOrderId(workOrderId);
        stockOutOrder.setWorkOrderNo(workOrder.getOrderNo());
        stockOutOrder.setPlanDate(LocalDateTime.now().toLocalDate());
        stockOutOrder.setStatus("COMPLETED");
        stockOutOrder.setActualDate(LocalDateTime.now());
        stockOutOrder.setCreateBy(userId);
        stockOutService.save(stockOutOrder);

        List<StockOutDetail> outDetails = new ArrayList<>();
        List<WorkOrderMaterial> workOrderMaterials = new ArrayList<>();
        BigDecimal totalAmount = BigDecimal.ZERO;
        int totalQty = 0;

        for (ProductBomDetail detail : bomDetails) {
            BigDecimal requiredQty = detail.getQuantity().multiply(BigDecimal.valueOf(workOrder.getQuantity()));
            BigDecimal unitPrice = detail.getUnitPrice() != null ? detail.getUnitPrice() : BigDecimal.ZERO;
            BigDecimal totalPrice = requiredQty.multiply(unitPrice);

            MaterialInventory inventory = materialInventoryService.getById(detail.getMaterialId());
            inventory.setQuantity(inventory.getQuantity().subtract(requiredQty));
            if (inventory.getQuantity().compareTo(inventory.getWarningQuantity()) <= 0) {
                inventory.setStatus("WARNING");
            }
            materialInventoryService.updateById(inventory);

            StockOutDetail outDetail = new StockOutDetail();
            outDetail.setOrderId(stockOutOrder.getId());
            outDetail.setMaterialId(detail.getMaterialId());
            outDetail.setMaterialCode(detail.getMaterialCode());
            outDetail.setMaterialName(detail.getMaterialName());
            outDetail.setSpecification(detail.getSpecification());
            outDetail.setUnit(detail.getUnit());
            outDetail.setQuantity(requiredQty);
            outDetail.setUnitPrice(unitPrice);
            outDetail.setTotalPrice(totalPrice);
            outDetail.setBatchNo(inventory.getBatchNo());
            outDetails.add(outDetail);

            WorkOrderMaterial woMaterial = new WorkOrderMaterial();
            woMaterial.setWorkOrderId(workOrderId);
            woMaterial.setMaterialId(detail.getMaterialId());
            woMaterial.setQuantity(requiredQty);
            woMaterial.setUnitPrice(unitPrice);
            woMaterial.setTotalPrice(totalPrice);
            workOrderMaterials.add(woMaterial);

            totalAmount = totalAmount.add(totalPrice);
            totalQty += requiredQty.intValue();
        }

        stockOutDetailService.saveBatch(outDetails);
        workOrderMaterialService.saveBatch(workOrderMaterials);

        stockOutOrder.setTotalAmount(totalAmount);
        stockOutOrder.setTotalQuantity(totalQty);
        stockOutService.updateById(stockOutOrder);

        workOrder.setStatus("CUTTING");
        workOrder.setCurrentProcess("裁切成型");
        workOrderService.updateById(workOrder);

        return Result.success("领料完成");
    }

    @PostMapping("/report")
    @RequiresRole({RoleConstants.PRODUCTION_LEADER})
    @Transactional(rollbackFor = Exception.class)
    public Result reportProduction(@RequestBody ProductionReport report,
                                   @RequestAttribute Long userId) {
        ProductionWorkOrder workOrder = workOrderService.getById(report.getWorkOrderId());
        if (workOrder == null) {
            return Result.error("工单不存在");
        }

        if (report.getReportQuantity() < report.getQualifiedQuantity() + report.getDefectiveQuantity()) {
            return Result.error("数量不匹配");
        }

        report.setWorkOrderNo(workOrder.getOrderNo());
        report.setCreateBy(userId);
        productionReportService.save(report);

        String nextStatus = getNextStatus(workOrder.getStatus());
        if (nextStatus != null) {
            workOrder.setStatus(nextStatus);
            workOrder.setCurrentProcess(getProcessName(nextStatus));
            if ("COMPLETED".equals(nextStatus)) {
                workOrder.setActualEndDate(LocalDateTime.now());
            }
            workOrderService.updateById(workOrder);
        }

        return Result.success(report.getId());
    }

    private String getNextStatus(String currentStatus) {
        switch (currentStatus) {
            case "CUTTING": return "STAMPING";
            case "STAMPING": return "PIPING";
            case "PIPING": return "ASSEMBLING";
            case "ASSEMBLING": return "LEAK_TESTING";
            case "LEAK_TESTING": return "PACKAGING";
            case "PACKAGING": return "COMPLETED";
            default: return null;
        }
    }

    private String getProcessName(String status) {
        switch (status) {
            case "CUTTING": return "裁切成型";
            case "STAMPING": return "翅片冲压成型";
            case "PIPING": return "管路穿插对接";
            case "ASSEMBLING": return "压合密封加固";
            case "LEAK_TESTING": return "压力检漏测试";
            case "PACKAGING": return "外观整理打包";
            case "COMPLETED": return "生产完成";
            default: return "";
        }
    }

    @PostMapping("/quality-inspection")
    @RequiresRole({RoleConstants.QUALITY_INSPECTOR})
    @Transactional(rollbackFor = Exception.class)
    public Result qualityInspection(@RequestBody QualityInspection inspection,
                                    @RequestAttribute Long userId,
                                    @RequestAttribute String username) {
        ProductionWorkOrder workOrder = workOrderService.getById(inspection.getWorkOrderId());
        if (workOrder == null) {
            return Result.error("工单不存在");
        }
        if (!"COMPLETED".equals(workOrder.getStatus())) {
            return Result.error("工单未完成生产");
        }

        String inspectionNo = "QI" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        inspection.setInspectionNo(inspectionNo);
        inspection.setWorkOrderNo(workOrder.getOrderNo());
        inspection.setInspectorId(userId);
        inspection.setInspectorName(username);
        inspection.setInspectionTime(LocalDateTime.now());
        inspection.setStatus("COMPLETED");

        if (inspection.getUnqualifiedQuantity() == 0) {
            inspection.setInspectionResult("PASS");
        } else {
            inspection.setInspectionResult("FAIL");
        }

        qualityInspectionService.save(inspection);

        if (inspection.getDetails() != null) {
            for (QualityInspectionDetail detail : inspection.getDetails()) {
                detail.setInspectionId(inspection.getId());
            }
            qualityInspectionDetailService.saveBatch(inspection.getDetails());
        }

        return Result.success(inspection.getId());
    }

    @PostMapping("/finished-storage/{workOrderId}")
    @RequiresRole({RoleConstants.WAREHOUSE_MANAGER, RoleConstants.QUALITY_INSPECTOR})
    @Transactional(rollbackFor = Exception.class)
    public Result finishedStorage(@PathVariable Long workOrderId,
                                  @RequestParam Long warehouseId,
                                  @RequestParam Long locationId,
                                  @RequestParam BigDecimal unitCost,
                                  @RequestAttribute Long userId) {
        ProductionWorkOrder workOrder = workOrderService.getById(workOrderId);
        if (workOrder == null) {
            return Result.error("工单不存在");
        }

        QualityInspection inspection = qualityInspectionService.getOne(
                new LambdaQueryWrapper<QualityInspection>()
                        .eq(QualityInspection::getWorkOrderId, workOrderId)
                        .eq(QualityInspection::getInspectionResult, "PASS")
                        .orderByDesc(QualityInspection::getInspectionTime)
                        .last("LIMIT 1")
        );
        if (inspection == null) {
            return Result.error("未找到合格的质检记录");
        }

        FinishedStock finishedStock = new FinishedStock();
        finishedStock.setWorkOrderId(workOrderId);
        finishedStock.setWorkOrderNo(workOrder.getOrderNo());
        finishedStock.setCategoryId(workOrder.getCategoryId());
        finishedStock.setQuantity(inspection.getQualifiedQuantity());
        finishedStock.setWarehouseId(warehouseId);
        finishedStock.setLocationId(locationId);
        finishedStock.setBatchNo("FIN" + workOrder.getOrderNo());
        finishedStock.setUnitCost(unitCost);
        finishedStock.setTotalCost(unitCost.multiply(BigDecimal.valueOf(inspection.getQualifiedQuantity())));
        finishedStock.setQualityLevel("GRADE_A");
        finishedStock.setInspectorId(inspection.getInspectorId());
        finishedStock.setStorageTime(LocalDateTime.now());
        finishedStockService.save(finishedStock);

        return Result.success("成品入库完成");
    }

    @GetMapping("/work-order-progress/{workOrderId}")
    @RequiresRole({RoleConstants.PRODUCTION_LEADER, RoleConstants.ASSEMBLY_TECHNICIAN})
    public Result getWorkOrderProgress(@PathVariable Long workOrderId) {
        ProductionWorkOrder workOrder = workOrderService.getById(workOrderId);
        if (workOrder == null) {
            return Result.error("工单不存在");
        }

        List<ProductionReport> reports = productionReportService.list(
                new LambdaQueryWrapper<ProductionReport>()
                        .eq(ProductionReport::getWorkOrderId, workOrderId)
                        .orderByAsc(ProductionReport::getCreateTime)
        );

        return Result.success(reports);
    }
}
