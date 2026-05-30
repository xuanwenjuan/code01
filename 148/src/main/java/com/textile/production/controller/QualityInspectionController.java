package com.textile.production.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.textile.production.annotation.RequiresRole;
import com.textile.production.common.Result;
import com.textile.production.common.RoleConstants;
import com.textile.production.entity.QualityInspection;
import com.textile.production.service.QualityInspectionService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/quality-inspection")
@RequiredArgsConstructor
public class QualityInspectionController {

    private final QualityInspectionService inspectionService;

    @GetMapping("/page")
    public Result<IPage<QualityInspection>> getPage(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) Long orderId,
            @RequestParam(required = false) String inspectType,
            @RequestParam(required = false) Integer inspectResult) {
        return inspectionService.getPage(pageNum, pageSize, orderId, inspectType, inspectResult);
    }

    @GetMapping("/{id}")
    public Result<QualityInspection> getById(@PathVariable Long id) {
        return inspectionService.getInspectionById(id);
    }

    @GetMapping("/order/{orderId}")
    public Result<List<QualityInspection>> getByOrderId(@PathVariable Long orderId) {
        return inspectionService.getInspectionsByOrderId(orderId);
    }

    @PostMapping
    @RequiresRole({RoleConstants.ADMIN, RoleConstants.INSPECTOR})
    public Result<QualityInspection> addInspection(@RequestBody QualityInspection inspection) {
        return inspectionService.addInspection(inspection);
    }
}
