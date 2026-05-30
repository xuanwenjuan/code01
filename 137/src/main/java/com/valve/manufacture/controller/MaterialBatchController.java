package com.valve.manufacture.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.valve.manufacture.annotation.RequiresRole;
import com.valve.manufacture.common.Result;
import com.valve.manufacture.constant.RoleConstants;
import com.valve.manufacture.entity.MaterialBatch;
import com.valve.manufacture.service.MaterialBatchService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/material-batches")
@RequiredArgsConstructor
@RequiresRole({RoleConstants.ADMIN, RoleConstants.PURCHASE, RoleConstants.PRODUCTION})
public class MaterialBatchController {

    private final MaterialBatchService materialBatchService;

    @GetMapping
    public Result<Page<MaterialBatch>> page(
            @RequestParam(defaultValue = "1") Integer current,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) Long materialId,
            @RequestParam(required = false) Integer status,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate) {
        Page<MaterialBatch> page = materialBatchService.pageWithCondition(current, size, materialId, status, startDate, endDate);
        return Result.success(page);
    }

    @GetMapping("/material/{materialId}")
    public Result<List<MaterialBatch>> getByMaterialId(@PathVariable Long materialId) {
        List<MaterialBatch> list = materialBatchService.getByMaterialId(materialId);
        return Result.success(list);
    }

    @GetMapping("/material/{materialId}/available")
    public Result<List<MaterialBatch>> getAvailableBatches(@PathVariable Long materialId) {
        List<MaterialBatch> list = materialBatchService.getAvailableBatches(materialId);
        return Result.success(list);
    }

    @PostMapping("/inbound")
    public Result<MaterialBatch> inbound(@Valid @RequestBody MaterialBatch batch,
                                         @RequestAttribute Long userId) {
        MaterialBatch created = materialBatchService.inbound(batch, userId);
        return Result.success("入库成功", created);
    }

    @PostMapping("/{batchId}/outbound")
    public Result<Void> outbound(@PathVariable Long batchId,
                                 @RequestBody Map<String, BigDecimal> request,
                                 @RequestAttribute Long userId) {
        BigDecimal quantity = request.get("quantity");
        String remark = request.containsKey("remark") ? request.get("remark").toString() : null;
        materialBatchService.outbound(batchId, quantity, userId, remark);
        return Result.success("出库成功");
    }

    @PostMapping("/{batchId}/use")
    public Result<Void> useBatch(@PathVariable Long batchId,
                                 @RequestBody Map<String, Object> request,
                                 @RequestAttribute Long userId) {
        BigDecimal quantity = new BigDecimal(request.get("quantity").toString());
        Long workOrderId = request.get("workOrderId") != null ?
                Long.parseLong(request.get("workOrderId").toString()) : null;
        materialBatchService.useBatch(batchId, quantity, workOrderId, userId);
        return Result.success("领用成功");
    }

    @PostMapping("/{batchId}/return")
    public Result<Void> returnBatch(@PathVariable Long batchId,
                                    @RequestBody Map<String, Object> request,
                                    @RequestAttribute Long userId) {
        BigDecimal quantity = new BigDecimal(request.get("quantity").toString());
        String remark = request.containsKey("remark") ? request.get("remark").toString() : null;
        materialBatchService.returnBatch(batchId, quantity, userId, remark);
        return Result.success("退库成功");
    }
}
