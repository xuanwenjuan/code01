package com.radiator.management.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.radiator.management.annotation.OpLog;
import com.radiator.management.annotation.RequiresRole;
import com.radiator.management.common.Result;
import com.radiator.management.entity.QualityInspection;
import com.radiator.management.entity.QualityInspectionDetail;
import com.radiator.management.service.QualityInspectionService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/quality-inspection")
@RequiredArgsConstructor
@RequiresRole({"quality_inspector", "production_leader"})
public class QualityInspectionController {

    private final QualityInspectionService inspectionService;

    @PostMapping
    @OpLog(module = "质检管理", operation = "创建质检单")
    public Result<Void> createInspection(@RequestBody QualityInspection inspection) {
        inspectionService.createInspection(inspection);
        return Result.success();
    }

    @PutMapping("/{id}/approve")
    @OpLog(module = "质检管理", operation = "审核质检单")
    public Result<Void> approveInspection(
            @PathVariable Long id,
            @RequestParam String result,
            HttpServletRequest request) {
        Long inspectorId = (Long) request.getAttribute("userId");
        String inspectorName = (String) request.getAttribute("username");
        inspectionService.approveInspection(id, inspectorId, inspectorName, result);
        return Result.success();
    }

    @PutMapping("/{id}/reject")
    @OpLog(module = "质检管理", operation = "拒绝质检单")
    public Result<Void> rejectInspection(@PathVariable Long id, @RequestParam String remark) {
        inspectionService.rejectInspection(id, remark);
        return Result.success();
    }

    @GetMapping("/page")
    public Result<Page<QualityInspection>> listInspections(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String type) {
        return Result.success(inspectionService.listInspections(page, size, status, type));
    }

    @GetMapping("/{id}")
    public Result<QualityInspection> getInspectionById(@PathVariable Long id) {
        return Result.success(inspectionService.getInspectionById(id));
    }

    @GetMapping("/{id}/details")
    public Result<List<QualityInspectionDetail>> getInspectionDetails(@PathVariable Long id) {
        return Result.success(inspectionService.getInspectionDetails(id));
    }
}
