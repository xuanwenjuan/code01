package com.radiator.management.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.radiator.management.annotation.RequiresRole;
import com.radiator.management.common.Result;
import com.radiator.management.constant.RoleConstants;
import com.radiator.management.dto.PageRequest;
import com.radiator.management.dto.PageResult;
import com.radiator.management.entity.*;
import com.radiator.management.service.*;
import com.radiator.management.util.PageUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/query")
public class CommonQueryController {

    @Autowired
    private PageUtil pageUtil;

    @Autowired
    private ProductionWorkOrderService workOrderService;

    @Autowired
    private MaterialInventoryService materialInventoryService;

    @Autowired
    private StockInOrderService stockInOrderService;

    @Autowired
    private StockOutOrderService stockOutOrderService;

    @Autowired
    private ProductionReportService productionReportService;

    @Autowired
    private QualityInspectionService qualityInspectionService;

    @Autowired
    private ProductionCostService productionCostService;

    @Autowired
    private ProductBomService bomService;

    @PostMapping("/work-orders")
    @RequiresRole({RoleConstants.ADMIN, RoleConstants.PRODUCTION_LEADER, RoleConstants.ASSEMBLY_TECHNICIAN})
    public Result queryWorkOrders(@RequestBody PageRequest pageRequest) {
        PageResult<ProductionWorkOrder> result = pageUtil.executePageQuery(
                pageRequest,
                wrapper -> workOrderService.list(wrapper),
                wrapper -> workOrderService.count(wrapper),
                ProductionWorkOrder.class,
                "work_orders"
        );
        return Result.success(result);
    }

    @PostMapping("/materials")
    @RequiresRole({RoleConstants.ADMIN, RoleConstants.PURCHASE_OFFICER, RoleConstants.WAREHOUSE_MANAGER})
    public Result queryMaterials(@RequestBody PageRequest pageRequest) {
        PageResult<MaterialInventory> result = pageUtil.executePageQuery(
                pageRequest,
                wrapper -> materialInventoryService.list(wrapper),
                wrapper -> materialInventoryService.count(wrapper),
                MaterialInventory.class,
                "materials"
        );
        return Result.success(result);
    }

    @PostMapping("/stock-in-orders")
    @RequiresRole({RoleConstants.ADMIN, RoleConstants.WAREHOUSE_MANAGER, RoleConstants.PURCHASE_OFFICER})
    public Result queryStockInOrders(@RequestBody PageRequest pageRequest) {
        PageResult<StockInOrder> result = pageUtil.executePageQuery(
                pageRequest,
                wrapper -> stockInOrderService.list(wrapper),
                wrapper -> stockInOrderService.count(wrapper),
                StockInOrder.class,
                "stock_in_orders"
        );
        return Result.success(result);
    }

    @PostMapping("/stock-out-orders")
    @RequiresRole({RoleConstants.ADMIN, RoleConstants.WAREHOUSE_MANAGER, RoleConstants.PRODUCTION_LEADER})
    public Result queryStockOutOrders(@RequestBody PageRequest pageRequest) {
        PageResult<StockOutOrder> result = pageUtil.executePageQuery(
                pageRequest,
                wrapper -> stockOutOrderService.list(wrapper),
                wrapper -> stockOutOrderService.count(wrapper),
                StockOutOrder.class,
                "stock_out_orders"
        );
        return Result.success(result);
    }

    @PostMapping("/production-reports")
    @RequiresRole({RoleConstants.ADMIN, RoleConstants.PRODUCTION_LEADER})
    public Result queryProductionReports(@RequestBody PageRequest pageRequest) {
        PageResult<ProductionReport> result = pageUtil.executePageQuery(
                pageRequest,
                wrapper -> productionReportService.list(wrapper),
                wrapper -> productionReportService.count(wrapper),
                ProductionReport.class,
                "production_reports"
        );
        return Result.success(result);
    }

    @PostMapping("/quality-inspections")
    @RequiresRole({RoleConstants.ADMIN, RoleConstants.QUALITY_INSPECTOR})
    public Result queryQualityInspections(@RequestBody PageRequest pageRequest) {
        PageResult<QualityInspection> result = pageUtil.executePageQuery(
                pageRequest,
                wrapper -> qualityInspectionService.list(wrapper),
                wrapper -> qualityInspectionService.count(wrapper),
                QualityInspection.class,
                "quality_inspections"
        );
        return Result.success(result);
    }

    @PostMapping("/production-costs")
    @RequiresRole({RoleConstants.ADMIN, RoleConstants.PRODUCTION_LEADER})
    public Result queryProductionCosts(@RequestBody PageRequest pageRequest) {
        PageResult<ProductionCost> result = pageUtil.executePageQuery(
                pageRequest,
                wrapper -> productionCostService.list(wrapper),
                wrapper -> productionCostService.count(wrapper),
                ProductionCost.class,
                "production_costs"
        );
        return Result.success(result);
    }

    @PostMapping("/boms")
    @RequiresRole({RoleConstants.ADMIN, RoleConstants.ASSEMBLY_TECHNICIAN, RoleConstants.PRODUCTION_LEADER})
    public Result queryBoms(@RequestBody PageRequest pageRequest) {
        PageResult<ProductBom> result = pageUtil.executePageQuery(
                pageRequest,
                wrapper -> bomService.list(wrapper),
                wrapper -> bomService.count(wrapper),
                ProductBom.class,
                "boms"
        );
        return Result.success(result);
    }

    @DeleteMapping("/cache/{pattern}")
    @RequiresRole({RoleConstants.ADMIN})
    public Result clearCache(@PathVariable String pattern) {
        pageUtil.clearCache(pattern);
        return Result.success("缓存已清除");
    }
}
