package com.oiledumbrella.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.oiledumbrella.annotation.RequiresRole;
import com.oiledumbrella.common.Result;
import com.oiledumbrella.entity.MaterialBatch;
import com.oiledumbrella.service.MaterialBatchService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/material-batch")
@RequiredArgsConstructor
public class MaterialBatchController {

    private final MaterialBatchService batchService;

    @GetMapping("/page")
    public Result<Page<MaterialBatch>> page(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) Long materialId,
            @RequestParam(required = false) Integer status) {
        Page<MaterialBatch> page = batchService.page(pageNum, pageSize, materialId, status);
        return Result.success(page);
    }

    @PostMapping("/in-stock")
    @RequiresRole({"ADMIN", "PURCHASER"})
    public Result<Void> inStock(@RequestBody MaterialBatch batch, HttpServletRequest request) {
        Long operatorId = (Long) request.getAttribute("userId");
        batchService.inStock(batch, operatorId);
        return Result.success("入库成功", null);
    }

    @PutMapping("/out-stock/{batchId}")
    @RequiresRole({"ADMIN", "PURCHASER"})
    public Result<Void> outStock(@PathVariable Long batchId,
                                  @RequestParam BigDecimal quantity,
                                  HttpServletRequest request) {
        Long operatorId = (Long) request.getAttribute("userId");
        batchService.outStock(batchId, quantity, operatorId);
        return Result.success("出库成功", null);
    }

    @GetMapping("/{id}")
    public Result<MaterialBatch> getById(@PathVariable Long id) {
        MaterialBatch batch = batchService.getById(id);
        return Result.success(batch);
    }

    @DeleteMapping("/{id}")
    @RequiresRole({"ADMIN"})
    public Result<Void> delete(@PathVariable Long id) {
        batchService.delete(id);
        return Result.success("删除成功", null);
    }
}
