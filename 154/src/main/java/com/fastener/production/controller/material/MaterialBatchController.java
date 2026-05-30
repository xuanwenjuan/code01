package com.fastener.production.controller.material;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.fastener.production.common.annotation.RequiresPermission;
import com.fastener.production.common.entity.PageQuery;
import com.fastener.production.common.result.Result;
import com.fastener.production.entity.material.MaterialBatch;
import com.fastener.production.entity.material.dto.MaterialInboundDTO;
import com.fastener.production.entity.material.dto.MaterialOutboundDTO;
import com.fastener.production.service.material.MaterialBatchService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@Tag(name = "原料库存管理", description = "原料批次库存和出入库管理接口")
@RestController
@RequestMapping("/material/batch")
@RequiredArgsConstructor
public class MaterialBatchController {

    private final MaterialBatchService materialBatchService;

    @Operation(summary = "分页查询批次列表")
    @GetMapping("/page")
    public Result<IPage<MaterialBatch>> page(PageQuery pageQuery,
                                             @RequestParam(required = false) Long materialId,
                                             @RequestParam(required = false) String batchCode,
                                             @RequestParam(required = false) Integer status) {
        return Result.success(materialBatchService.page(pageQuery, materialId, batchCode, status));
    }

    @Operation(summary = "获取原料可用批次列表")
    @GetMapping("/available/{materialId}")
    public Result<List<MaterialBatch>> getAvailableBatches(@PathVariable Long materialId) {
        return Result.success(materialBatchService.getAvailableBatches(materialId));
    }

    @Operation(summary = "获取原料可用库存总量")
    @GetMapping("/quantity/{materialId}")
    public Result<BigDecimal> getAvailableQuantity(@PathVariable Long materialId) {
        return Result.success(materialBatchService.getAvailableQuantity(materialId));
    }

    @Operation(summary = "生成批次编码")
    @GetMapping("/generateCode/{materialId}")
    @RequiresPermission("material:purchase")
    public Result<String> generateBatchCode(@PathVariable Long materialId) {
        return Result.success(materialBatchService.generateBatchCode(materialId));
    }

    @Operation(summary = "原料入库")
    @PostMapping("/inbound")
    @RequiresPermission("material:purchase")
    public Result<Void> inbound(@Valid @RequestBody MaterialInboundDTO dto) {
        materialBatchService.inbound(dto);
        return Result.success();
    }

    @Operation(summary = "原料出库")
    @PostMapping("/outbound")
    @RequiresPermission("production:manage")
    public Result<Void> outbound(@Valid @RequestBody MaterialOutboundDTO dto) {
        materialBatchService.outbound(dto);
        return Result.success();
    }

    @Operation(summary = "获取批次详情")
    @GetMapping("/{id}")
    public Result<MaterialBatch> getById(@PathVariable Long id) {
        return Result.success(materialBatchService.getById(id));
    }
}
