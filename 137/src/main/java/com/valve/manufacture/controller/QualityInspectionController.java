package com.valve.manufacture.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.valve.manufacture.annotation.RequiresRole;
import com.valve.manufacture.common.Result;
import com.valve.manufacture.constant.RoleConstants;
import com.valve.manufacture.entity.QualityInspection;
import com.valve.manufacture.service.QualityInspectionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/quality-inspections")
@RequiredArgsConstructor
@RequiresRole({RoleConstants.ADMIN, RoleConstants.QUALITY})
public class QualityInspectionController {

    private final QualityInspectionService qualityInspectionService;

    @GetMapping
    public Result<Page<QualityInspection>> page(
            @RequestParam(defaultValue = "1") Integer current,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) String inspectionResult,
            @RequestParam(required = false) Long inspectorId) {
        LambdaQueryWrapper<QualityInspection> wrapper = new LambdaQueryWrapper<>();
        if (inspectionResult != null && !inspectionResult.isEmpty()) {
            wrapper.eq(QualityInspection::getInspectionResult, inspectionResult);
        }
        if (inspectorId != null) {
            wrapper.eq(QualityInspection::getInspectorId, inspectorId);
        }
        wrapper.eq(QualityInspection::getDeleted, 0);
        wrapper.orderByDesc(QualityInspection::getCreateTime);

        Page<QualityInspection> page = qualityInspectionService.page(new Page<>(current, size), wrapper);
        return Result.success(page);
    }

    @GetMapping("/work-order/{workOrderId}")
    public Result<List<QualityInspection>> getByWorkOrderId(@PathVariable Long workOrderId) {
        List<QualityInspection> list = qualityInspectionService.getByWorkOrderId(workOrderId);
        return Result.success(list);
    }

    @GetMapping("/{id}")
    public Result<QualityInspection> getById(@PathVariable Long id) {
        QualityInspection inspection = qualityInspectionService.getById(id);
        return Result.success(inspection);
    }

    @PostMapping
    public Result<QualityInspection> create(@Valid @RequestBody QualityInspection inspection) {
        QualityInspection created = qualityInspectionService.create(inspection);
        return Result.success("创建成功", created);
    }

    @PutMapping("/{id}")
    public Result<QualityInspection> update(@PathVariable Long id, @Valid @RequestBody QualityInspection inspection) {
        inspection.setId(id);
        qualityInspectionService.updateById(inspection);
        return Result.success("更新成功", qualityInspectionService.getById(id));
    }
}
