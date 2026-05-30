package com.snacktrace.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.snacktrace.annotation.RequireRole;
import com.snacktrace.common.Result;
import com.snacktrace.dto.MaterialInboundDTO;
import com.snacktrace.dto.MaterialQueryDTO;
import com.snacktrace.dto.MaterialUseDTO;
import com.snacktrace.entity.Material;
import com.snacktrace.entity.MaterialBatch;
import com.snacktrace.entity.MaterialStockFlow;
import com.snacktrace.entity.MaterialStockLock;
import com.snacktrace.enums.RoleEnum;
import com.snacktrace.service.MaterialService;
import com.snacktrace.service.MaterialStockLockService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/material")
public class MaterialController {

    @Autowired
    private MaterialService materialService;

    @Autowired
    private MaterialStockLockService stockLockService;

    @GetMapping("/page")
    public Result<Page<Material>> queryMaterialPage(@Valid MaterialQueryDTO queryDTO) {
        Page<Material> page = materialService.queryMaterialPage(queryDTO);
        return Result.success(page);
    }

    @PostMapping
    @RequireRole({RoleEnum.ADMIN, RoleEnum.PURCHASER})
    public Result<Void> addMaterial(@RequestBody Material material) {
        boolean success = materialService.save(material);
        return success ? Result.success("添加成功") : Result.error("添加失败");
    }

    @PutMapping
    @RequireRole({RoleEnum.ADMIN, RoleEnum.PURCHASER})
    public Result<Void> updateMaterial(@RequestBody Material material) {
        boolean success = materialService.updateById(material);
        return success ? Result.success("更新成功") : Result.error("更新失败");
    }

    @PostMapping("/inbound")
    @RequireRole({RoleEnum.ADMIN, RoleEnum.PURCHASER})
    public Result<Void> inboundMaterial(@Valid @RequestBody MaterialInboundDTO dto, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        String username = (String) request.getAttribute("username");
        boolean success = materialService.inboundMaterial(dto, userId, username);
        return success ? Result.success("入库成功") : Result.error("入库失败");
    }

    @GetMapping("/batch/page")
    public Result<Page<MaterialBatch>> queryBatchPage(
            @RequestParam(required = false) Long materialId,
            @RequestParam(required = false) Integer status,
            @RequestParam(required = false) String origin,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<MaterialBatch> result = materialService.queryBatchPage(materialId, status, origin, page, size);
        return Result.success(result);
    }

    @GetMapping("/batch/expiring")
    @RequireRole({RoleEnum.ADMIN, RoleEnum.PURCHASER, RoleEnum.TEAM_LEADER})
    public Result<List<MaterialBatch>> getExpiringBatches() {
        List<MaterialBatch> list = materialService.getExpiringBatches();
        return Result.success(list);
    }

    @PostMapping("/use")
    @RequireRole({RoleEnum.ADMIN, RoleEnum.TEAM_LEADER})
    public Result<Void> useMaterial(@Valid @RequestBody MaterialUseDTO useDTO, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        String username = (String) request.getAttribute("username");
        boolean success = materialService.useMaterial(useDTO, userId, username);
        return success ? Result.success("领料成功") : Result.error("领料失败");
    }

    @PostMapping("/return")
    @RequireRole({RoleEnum.ADMIN, RoleEnum.TEAM_LEADER})
    public Result<Void> returnMaterial(@Valid @RequestBody MaterialUseDTO returnDTO, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        String username = (String) request.getAttribute("username");
        boolean success = materialService.returnMaterial(returnDTO, userId, username);
        return success ? Result.success("退料成功") : Result.error("退料失败");
    }

    @PostMapping("/lock")
    @RequireRole({RoleEnum.ADMIN, RoleEnum.TEAM_LEADER})
    public Result<Void> lockStock(
            @RequestParam Long workOrderId,
            @RequestParam Long materialId,
            @RequestParam Long batchId,
            @RequestParam java.math.BigDecimal quantity,
            HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        String username = (String) request.getAttribute("username");
        boolean success = materialService.lockStockForWorkOrder(workOrderId, materialId, batchId, quantity, userId, username);
        return success ? Result.success("锁定成功") : Result.error("锁定失败");
    }

    @PostMapping("/unlock")
    @RequireRole({RoleEnum.ADMIN, RoleEnum.TEAM_LEADER})
    public Result<Void> unlockStock(@RequestParam Long workOrderId) {
        boolean success = materialService.releaseStockForWorkOrder(workOrderId);
        return success ? Result.success("解锁成功") : Result.error("解锁失败");
    }

    @GetMapping("/lock/{workOrderId}")
    public Result<List<MaterialStockLock>> getStockLocksByWorkOrderId(@PathVariable Long workOrderId) {
        List<MaterialStockLock> list = stockLockService.getLocksByWorkOrderId(workOrderId);
        return Result.success(list);
    }

    @PostMapping("/defect")
    @RequireRole({RoleEnum.ADMIN, RoleEnum.QC_INSPECTOR})
    public Result<Void> handleDefectiveMaterial(
            @RequestParam Long materialId,
            @RequestParam Long batchId,
            @RequestParam java.math.BigDecimal quantity,
            @RequestParam String reason,
            HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        String username = (String) request.getAttribute("username");
        boolean success = materialService.handleDefectiveMaterial(materialId, batchId, quantity, reason, userId, username);
        return success ? Result.success("次品处理成功") : Result.error("处理失败");
    }

    @GetMapping("/stock/flow/page")
    public Result<Page<MaterialStockFlow>> queryStockFlowPage(
            @RequestParam(required = false) Long materialId,
            @RequestParam(required = false) Long workOrderId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<MaterialStockFlow> result = materialService.queryStockFlowPage(materialId, workOrderId, page, size);
        return Result.success(result);
    }
}
