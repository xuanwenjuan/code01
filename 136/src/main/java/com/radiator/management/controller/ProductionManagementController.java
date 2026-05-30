package com.radiator.management.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.radiator.management.annotation.RequiresRole;
import com.radiator.management.common.Result;
import com.radiator.management.constant.RoleConstants;
import com.radiator.management.dto.MaterialQueryDTO;
import com.radiator.management.entity.*;
import com.radiator.management.service.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import javax.validation.constraints.DecimalMin;
import javax.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/production-management")
@Validated
public class ProductionManagementController {

    @Autowired
    private MaterialQueryService materialQueryService;

    @Autowired
    private MaterialLockService materialLockService;

    @Autowired
    private ProductionLossService productionLossService;

    @Autowired
    private ProductionWorkOrderService workOrderService;

    @Autowired
    private ProductBomService bomService;

    @Autowired
    private ProductBomDetailService bomDetailService;

    @Autowired
    private MaterialInventoryService materialInventoryService;

    @Autowired
    private StockOutService stockOutService;

    @Autowired
    private StockOutDetailService stockOutDetailService;

    @PostMapping("/materials/query")
    @RequiresRole({RoleConstants.ADMIN, RoleConstants.PURCHASE_OFFICER, RoleConstants.WAREHOUSE_MANAGER, RoleConstants.PRODUCTION_LEADER})
    public Result<IPage<MaterialInventory>> queryMaterials(@Valid @RequestBody MaterialQueryDTO dto) {
        IPage<MaterialInventory> page = materialQueryService.queryMaterials(dto);
        return Result.success(page);
    }

    @GetMapping("/materials/{id}/availability")
    @RequiresRole({RoleConstants.ADMIN, RoleConstants.WAREHOUSE_MANAGER, RoleConstants.PRODUCTION_LEADER})
    public Result<Map<String, BigDecimal>> getMaterialAvailability(@PathVariable Long id) {
        MaterialInventory inventory = materialInventoryService.getById(id);
        if (inventory == null) {
            return Result.error("物料不存在");
        }
        BigDecimal lockedQty = materialLockService.getLockedQuantity(id);
        BigDecimal availableQty = inventory.getQuantity().subtract(lockedQty);

        Map<String, BigDecimal> result = new HashMap<>();
        result.put("totalQuantity", inventory.getQuantity());
        result.put("lockedQuantity", lockedQty);
        result.put("availableQuantity", availableQty);
        result.put("warningQuantity", inventory.getWarningQuantity());

        return Result.success(result);
    }

    @PostMapping("/material-lock/lock")
    @RequiresRole({RoleConstants.ADMIN, RoleConstants.PRODUCTION_LEADER})
    @Transactional(rollbackFor = Exception.class)
    public Result<Void> lockMaterial(
            @RequestParam @NotNull(message = "工单ID不能为空") Long workOrderId,
            @RequestParam @NotNull(message = "物料ID不能为空") Long materialId,
            @RequestParam @NotNull(message = "锁定数量不能为空") @DecimalMin(value = "0.01", message = "锁定数量必须大于0") BigDecimal quantity,
            @RequestAttribute Long userId,
            @RequestAttribute String username) {

        ProductionWorkOrder workOrder = workOrderService.getById(workOrderId);
        if (workOrder == null) {
            return Result.error("工单不存在");
        }

        materialLockService.lockMaterial(
                workOrderId, workOrder.getOrderNo(), materialId, quantity, "PRODUCTION", userId, username
        );

        return Result.success("物料锁定成功");
    }

    @PostMapping("/material-lock/unlock")
    @RequiresRole({RoleConstants.ADMIN, RoleConstants.PRODUCTION_LEADER})
    @Transactional(rollbackFor = Exception.class)
    public Result<Void> unlockMaterial(
            @RequestParam @NotNull(message = "工单ID不能为空") Long workOrderId,
            @RequestParam @NotNull(message = "物料ID不能为空") Long materialId,
            @RequestAttribute Long userId,
            @RequestAttribute String username) {

        materialLockService.unlockMaterial(workOrderId, materialId, userId, username);
        return Result.success("物料解锁成功");
    }

    @GetMapping("/material-lock/work-order/{workOrderId}")
    @RequiresRole({RoleConstants.ADMIN, RoleConstants.PRODUCTION_LEADER, RoleConstants.WAREHOUSE_MANAGER})
    public Result<List<MaterialLock>> getWorkOrderLocks(@PathVariable Long workOrderId) {
        List<MaterialLock> locks = materialLockService.getWorkOrderLocks(workOrderId);
        return Result.success(locks);
    }

    @PostMapping("/production-loss/report")
    @RequiresRole({RoleConstants.ADMIN, RoleConstants.PRODUCTION_LEADER})
    @Transactional(rollbackFor = Exception.class)
    public Result<Void> reportLoss(
            @RequestParam @NotNull(message = "工单ID不能为空") Long workOrderId,
            @RequestParam @NotNull(message = "物料ID不能为空") Long materialId,
            @RequestParam @NotNull(message = "损耗数量不能为空") @DecimalMin(value = "0.01", message = "损耗数量必须大于0") BigDecimal lossQuantity,
            @RequestParam String lossType,
            @RequestParam String lossReason,
            @RequestParam String responsiblePerson,
            @RequestAttribute Long userId,
            @RequestAttribute String username) {

        ProductionWorkOrder workOrder = workOrderService.getById(workOrderId);
        if (workOrder == null) {
            return Result.error("工单不存在");
        }

        productionLossService.reportLoss(
                workOrderId, workOrder.getOrderNo(), materialId, lossQuantity,
                lossType, lossReason, responsiblePerson, userId, username
        );

        return Result.success("报损成功");
    }

    @PostMapping("/production-loss/collect/{workOrderId}")
    @RequiresRole({RoleConstants.ADMIN})
    @Transactional(rollbackFor = Exception.class)
    public Result<Map<String, Object>> collectLoss(@PathVariable Long workOrderId) {
        Map<String, Object> result = productionLossService.collectAndChargeLoss(workOrderId);
        return Result.success(result);
    }

    @GetMapping("/production-loss/work-order/{workOrderId}")
    @RequiresRole({RoleConstants.ADMIN, RoleConstants.PRODUCTION_LEADER})
    public Result<List<ProductionLoss>> getWorkOrderLosses(@PathVariable Long workOrderId) {
        List<ProductionLoss> losses = productionLossService.getWorkOrderLosses(workOrderId);
        return Result.success(losses);
    }

    @GetMapping("/production-loss/summary/{workOrderId}")
    @RequiresRole({RoleConstants.ADMIN, RoleConstants.PRODUCTION_LEADER})
    public Result<Map<String, BigDecimal>> getLossSummary(@PathVariable Long workOrderId) {
        Map<String, BigDecimal> summary = productionLossService.getLossSummaryByType(workOrderId);
        return Result.success(summary);
    }

    @PostMapping("/work-order/pick-materials/{workOrderId}")
    @RequiresRole({RoleConstants.ADMIN, RoleConstants.PRODUCTION_LEADER, RoleConstants.WAREHOUSE_MANAGER})
    @Transactional(rollbackFor = Exception.class)
    public Result<Map<String, Object>> pickMaterials(
            @PathVariable Long workOrderId,
            @RequestParam Long warehouseId,
            @RequestAttribute Long userId,
            @RequestAttribute String username) {

        ProductionWorkOrder workOrder = workOrderService.getById(workOrderId);
        if (workOrder == null) {
            return Result.error("工单不存在");
        }

        ProductBom bom = bomService.lambdaQuery()
                .eq(ProductBom::getCategoryId, workOrder.getCategoryId())
                .oneOpt()
                .orElseThrow(() -> new RuntimeException("产品BOM未配置"));

        List<ProductBomDetail> bomDetails = bomDetailService.lambdaQuery()
                .eq(ProductBomDetail::getBomId, bom.getId())
                .list();

        if (bomDetails.isEmpty()) {
            return Result.error("BOM明细为空");
        }

        Map<String, Object> result = new HashMap<>();
        BigDecimal totalAmount = BigDecimal.ZERO;

        for (ProductBomDetail detail : bomDetails) {
            BigDecimal requiredQty = detail.getQuantity().multiply(BigDecimal.valueOf(workOrder.getQuantity()));
            MaterialInventory inventory = materialInventoryService.getById(detail.getMaterialId());

            BigDecimal lockedQty = materialLockService.getLockedQuantity(detail.getMaterialId());
            BigDecimal availableQty = inventory.getQuantity().subtract(lockedQty);

            if (availableQty.compareTo(requiredQty) < 0) {
                result.put("success", false);
                result.put("message", "物料库存不足：" + inventory.getMaterialName() + "，需要：" + requiredQty + "，可用：" + availableQty);
                return Result.error(result.toString());
            }

            materialLockService.lockMaterial(workOrderId, workOrder.getOrderNo(), detail.getMaterialId(),
                    requiredQty, "PICKING", userId, username);

            BigDecimal amount = requiredQty.multiply(detail.getUnitPrice());
            totalAmount = totalAmount.add(amount);

            inventory.setQuantity(inventory.getQuantity().subtract(requiredQty));
            materialInventoryService.updateById(inventory);

            materialLockService.consumeLockedMaterial(workOrderId, detail.getMaterialId(), requiredQty);
        }

        workOrder.setStatus("CUTTING");
        workOrder.setCurrentProcess("裁切成型");
        workOrderService.updateById(workOrder);

        result.put("success", true);
        result.put("totalAmount", totalAmount);
        result.put("message", "领料成功");

        return Result.success(result);
    }
}
