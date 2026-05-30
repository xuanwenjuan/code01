package com.snacktrace.controller;

import com.snacktrace.annotation.RequireRole;
import com.snacktrace.common.Result;
import com.snacktrace.dto.QcInspectionDTO;
import com.snacktrace.entity.QcInspection;
import com.snacktrace.enums.RoleEnum;
import com.snacktrace.service.QcInspectionService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/qc")
public class QcInspectionController {

    @Autowired
    private QcInspectionService qcInspectionService;

    @GetMapping("/list")
    public Result<List<QcInspection>> getInspectionList(
            @RequestParam(required = false) Long workOrderId,
            @RequestParam(required = false) Integer stage) {
        List<QcInspection> list = qcInspectionService.getInspectionList(workOrderId, stage);
        return Result.success(list);
    }

    @PostMapping
    @RequireRole({RoleEnum.ADMIN, RoleEnum.QC_INSPECTOR})
    public Result<Void> addInspection(@Valid @RequestBody QcInspectionDTO dto) {
        boolean success = qcInspectionService.addInspection(dto);
        return success ? Result.success("巡检记录添加成功", null) : Result.error("添加失败");
    }
}
