package com.watchrepair.admin.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.watchrepair.admin.annotation.OperationLogger;
import com.watchrepair.admin.common.PageQuery;
import com.watchrepair.admin.common.Result;
import com.watchrepair.admin.dto.RepairPartDTO;
import com.watchrepair.admin.dto.RepairPartQueryDTO;
import com.watchrepair.admin.entity.RepairPart;
import com.watchrepair.admin.service.RepairPartService;
import com.watchrepair.admin.vo.RepairPartVO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/part")
@RequiredArgsConstructor
public class RepairPartController {

    private final RepairPartService partService;

    @GetMapping("/page")
    public Result<Page<RepairPartVO>> getPartPage(
            @Valid PageQuery pageQuery,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Integer status) {
        return Result.success(partService.getPartPage(pageQuery, keyword, status));
    }

    @PostMapping("/query")
    public Result<Page<RepairPartVO>> queryParts(
            @Valid PageQuery pageQuery,
            @Valid @RequestBody RepairPartQueryDTO queryDTO) {
        return Result.success(partService.queryParts(pageQuery, queryDTO));
    }

    @GetMapping("/warning")
    public Result<List<RepairPart>> getWarningParts() {
        return Result.success(partService.getWarningParts());
    }

    @GetMapping("/moisture-proof")
    public Result<List<RepairPart>> getMoistureProofParts() {
        return Result.success(partService.getMoistureProofParts());
    }

    @GetMapping("/{id}")
    public Result<RepairPart> getPartById(@PathVariable Long id) {
        return Result.success(partService.getPartById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('1', '4')")
    @OperationLogger("新增维修配件")
    public Result<Void> addPart(@Valid @RequestBody RepairPartDTO dto) {
        partService.addPart(dto);
        return Result.success();
    }

    @PutMapping
    @PreAuthorize("hasAnyRole('1', '4')")
    @OperationLogger("更新维修配件")
    public Result<Void> updatePart(@Valid @RequestBody RepairPartDTO dto) {
        partService.updatePart(dto);
        return Result.success();
    }

    @PutMapping("/{id}/stock")
    @PreAuthorize("hasAnyRole('1', '4')")
    @OperationLogger("更新配件库存")
    public Result<Void> updateStock(@PathVariable Long id, @RequestParam Integer quantity) {
        partService.updateStock(id, quantity);
        return Result.success();
    }

    @PutMapping("/{id}/discontinue")
    @PreAuthorize("hasAnyRole('1', '4')")
    @OperationLogger("停用维修配件")
    public Result<Void> discontinuePart(@PathVariable Long id) {
        partService.discontinuePart(id);
        return Result.success();
    }
}