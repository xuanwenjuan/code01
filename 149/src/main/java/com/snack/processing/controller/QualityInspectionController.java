package com.snack.processing.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.snack.processing.common.Result;
import com.snack.processing.dto.quality.QualityInspectionAddDTO;
import com.snack.processing.dto.quality.QualityInspectionQueryDTO;
import com.snack.processing.entity.QualityInspection;
import com.snack.processing.service.QualityInspectionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/quality-inspection")
@RequiredArgsConstructor
@Tag(name = "质量管理", description = "质量检验记录管理")
public class QualityInspectionController {

    private final QualityInspectionService inspectionService;

    @PostMapping
    @Operation(summary = "新增质检记录")
    public Result<QualityInspection> addInspection(@Valid @RequestBody QualityInspectionAddDTO dto) {
        return inspectionService.addInspection(dto);
    }

    @GetMapping("/{id}")
    @Operation(summary = "获取质检记录详情")
    public Result<QualityInspection> getInspectionById(@PathVariable Long id) {
        return inspectionService.getInspectionById(id);
    }

    @GetMapping("/page")
    @Operation(summary = "分页查询质检记录")
    public Result<IPage<QualityInspection>> getInspectionPage(QualityInspectionQueryDTO dto) {
        return inspectionService.getInspectionPage(dto);
    }
}
