package com.fan.impeller.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.fan.impeller.annotation.RequiresRole;
import com.fan.impeller.common.Constants;
import com.fan.impeller.common.PageQuery;
import com.fan.impeller.common.Result;
import com.fan.impeller.dto.QualityInspectionDTO;
import com.fan.impeller.entity.QualityInspection;
import com.fan.impeller.service.QualityInspectionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/quality-inspection")
@RequiredArgsConstructor
public class QualityInspectionController {

    private final QualityInspectionService qualityInspectionService;

    @GetMapping("/page")
    public Result<Page<QualityInspection>> page(PageQuery query,
                                                 @RequestParam(required = false) Long workOrderId,
                                                 @RequestParam(required = false) Integer result) {
        return Result.success(qualityInspectionService.page(query, workOrderId, result));
    }

    @GetMapping("/{id}")
    public Result<QualityInspection> getById(@PathVariable Long id) {
        return Result.success(qualityInspectionService.getDetailById(id));
    }

    @PostMapping
    @RequiresRole({Constants.ROLE_QUALITY})
    public Result<Void> create(@Valid @RequestBody QualityInspectionDTO dto) {
        qualityInspectionService.createInspection(dto);
        return Result.success();
    }

    @GetMapping("/statistics")
    public Result<Map<String, Object>> getStatistics() {
        return Result.success(qualityInspectionService.getQualityStatistics());
    }

    @DeleteMapping("/{id}")
    @RequiresRole({Constants.ROLE_ADMIN})
    public Result<Void> delete(@PathVariable Long id) {
        qualityInspectionService.removeById(id);
        return Result.success();
    }
}
