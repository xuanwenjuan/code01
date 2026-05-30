package com.gearbox.manage.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.gearbox.manage.annotation.RequiresRole;
import com.gearbox.manage.common.Result;
import com.gearbox.manage.dto.QualityInspectionDTO;
import com.gearbox.manage.entity.QualityInspection;
import com.gearbox.manage.service.QualityInspectionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/qualityInspection")
@RequiredArgsConstructor
public class QualityInspectionController {

    private final QualityInspectionService qualityInspectionService;

    @GetMapping("/page")
    public Result<Page<QualityInspection>> listPage(
            @RequestParam(defaultValue = "1") int pageNum,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(required = false) String result) {
        return Result.success(qualityInspectionService.listPage(pageNum, pageSize, result));
    }

    @GetMapping("/workOrder/{workOrderId}")
    public Result<List<QualityInspection>> getByWorkOrderId(@PathVariable Long workOrderId) {
        return Result.success(qualityInspectionService.getByWorkOrderId(workOrderId));
    }

    @GetMapping("/{id}")
    public Result<QualityInspection> getById(@PathVariable Long id) {
        return Result.success(qualityInspectionService.getById(id));
    }

    @PostMapping
    @RequiresRole({"ADMIN", "QUALITY_INSPECTOR"})
    public Result<QualityInspection> create(@Valid @RequestBody QualityInspectionDTO dto) {
        return Result.success(qualityInspectionService.createInspection(dto));
    }

    @PutMapping("/{id}")
    @RequiresRole({"ADMIN", "QUALITY_INSPECTOR"})
    public Result<Void> update(@PathVariable Long id, @Valid @RequestBody QualityInspectionDTO dto) {
        return qualityInspectionService.updateInspection(id, dto) ? Result.success() : Result.error("更新失败");
    }

    @DeleteMapping("/{id}")
    @RequiresRole({"ADMIN"})
    public Result<Void> delete(@PathVariable Long id) {
        return qualityInspectionService.removeById(id) ? Result.success() : Result.error("删除失败");
    }

    @GetMapping("/statistics")
    @RequiresRole({"ADMIN", "QUALITY_INSPECTOR"})
    public Result<java.util.Map<String, Object>> getStatistics() {
        return Result.success(qualityInspectionService.getStatistics());
    }
}
