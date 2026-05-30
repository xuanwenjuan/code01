package com.liquor.brewing.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.liquor.brewing.common.PageQuery;
import com.liquor.brewing.common.PageResult;
import com.liquor.brewing.common.Result;
import com.liquor.brewing.entity.MaterialBatch;
import com.liquor.brewing.service.MaterialBatchService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.annotation.Resource;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "物料批次管理", description = "物料批次管理接口")
@RestController
@RequestMapping("/material/batch")
public class MaterialBatchController {

    @Resource
    private MaterialBatchService materialBatchService;

    @Operation(summary = "分页查询物料批次")
    @GetMapping("/page")
    public Result<PageResult<MaterialBatch>> page(
            @RequestParam(required = false) Long materialId,
            @RequestParam(required = false) Integer status,
            @RequestParam(required = false) String batchCode,
            PageQuery pageQuery) {
        IPage<MaterialBatch> page = materialBatchService.page(materialId, status, batchCode, pageQuery);
        return Result.success(PageResult.of(page));
    }

    @Operation(summary = "获取批次详情")
    @GetMapping("/{id}")
    public Result<MaterialBatch> getById(@PathVariable Long id) {
        return Result.success(materialBatchService.getById(id));
    }

    @Operation(summary = "根据物料ID获取可用批次")
    @GetMapping("/material/{materialId}")
    public Result<List<MaterialBatch>> getByMaterialId(@PathVariable Long materialId) {
        return Result.success(materialBatchService.getByMaterialId(materialId));
    }
}
