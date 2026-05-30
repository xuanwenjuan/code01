package com.household.management.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.household.management.common.annotation.OperationLog;
import com.household.management.common.entity.PageQuery;
import com.household.management.common.result.Result;
import com.household.management.entity.QualityInspection;
import com.household.management.service.QualityInspectionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Tag(name = "品质巡检管理")
@RestController
@RequestMapping("/quality/inspection")
public class QualityInspectionController {

    private final QualityInspectionService inspectionService;

    public QualityInspectionController(QualityInspectionService inspectionService) {
        this.inspectionService = inspectionService;
    }

    @GetMapping("/page")
    @Operation(summary = "分页查询巡检单列表")
    public Result<IPage<QualityInspection>> page(PageQuery pageQuery,
                                                   @RequestParam(required = false) String inspectionType,
                                                   @RequestParam(required = false) Integer status,
                                                   @RequestParam(required = false) Integer result) {
        return Result.success(inspectionService.page(pageQuery, inspectionType, status, result));
    }

    @GetMapping("/list")
    @Operation(summary = "获取巡检单列表")
    public Result<List<QualityInspection>> list() {
        return Result.success(inspectionService.list());
    }

    @GetMapping("/{id}")
    @Operation(summary = "获取巡检单详情")
    public Result<QualityInspection> getById(@PathVariable Long id) {
        return Result.success(inspectionService.getById(id));
    }

    @PostMapping
    @Operation(summary = "创建品质巡检单")
    @OperationLog(module = "品质巡检管理", operation = "创建巡检单")
    public Result<Void> createInspection(@Valid @RequestBody QualityInspection inspection) {
        inspectionService.createInspection(inspection);
        return Result.success();
    }

    @PutMapping("/{id}/submit")
    @Operation(summary = "提交巡检结果")
    @OperationLog(module = "品质巡检管理", operation = "提交巡检结果")
    public Result<Void> submitInspection(@PathVariable Long id,
                                          @RequestBody Map<String, Object> request,
                                          HttpServletRequest servletRequest) {
        Long inspectorId = (Long) servletRequest.getAttribute("currentUserId");
        Integer result = Integer.valueOf(request.get("inspectionResult").toString());
        String items = (String) request.get("inspectionItems");
        String defectiveDesc = (String) request.get("defectiveDescription");
        String handlingSuggestion = (String) request.get("handlingSuggestion");
        inspectionService.submitInspection(id, inspectorId, result, items, defectiveDesc, handlingSuggestion);
        return Result.success();
    }

    @PutMapping
    @Operation(summary = "更新巡检单")
    @OperationLog(module = "品质巡检管理", operation = "更新巡检单")
    public Result<Void> updateInspection(@Valid @RequestBody QualityInspection inspection) {
        inspectionService.updateInspection(inspection);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "删除巡检单")
    @OperationLog(module = "品质巡检管理", operation = "删除巡检单")
    public Result<Void> deleteInspection(@PathVariable Long id) {
        inspectionService.deleteInspection(id);
        return Result.success();
    }
}
