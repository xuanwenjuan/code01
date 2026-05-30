package com.amber.polish.controller;

import com.amber.polish.annotation.OperationLog;
import com.amber.polish.common.Result;
import com.amber.polish.dto.RawStoneDTO;
import com.amber.polish.dto.RawStoneQueryDTO;
import com.amber.polish.entity.RawStone;
import com.amber.polish.service.RawStoneService;
import com.amber.polish.util.JwtUtil;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/raw-stone")
@RequiredArgsConstructor
public class RawStoneController {

    private final RawStoneService rawStoneService;
    private final JwtUtil jwtUtil;

    @GetMapping("/page")
    @OperationLog(module = "原石管理", type = "查询", description = "分页查询原石列表")
    public Result<Page<RawStone>> getRawStonePage(
            @RequestParam(defaultValue = "1") int pageNum,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String status) {
        Page<RawStone> page = rawStoneService.getRawStonePage(pageNum, pageSize, categoryId, status);
        return Result.success(page);
    }

    @PostMapping("/query")
    @OperationLog(module = "原石管理", type = "查询", description = "多条件组合查询原石")
    public Result<Page<RawStone>> queryRawStone(
            @RequestParam(defaultValue = "1") int pageNum,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestBody RawStoneQueryDTO queryDTO) {
        Page<RawStone> page = rawStoneService.queryRawStoneByConditions(pageNum, pageSize, queryDTO);
        return Result.success(page);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PURCHASER')")
    @OperationLog(module = "原石管理", type = "新增", description = "新增原石入库")
    public Result<Void> addRawStone(@Valid @RequestBody RawStoneDTO dto, HttpServletRequest request) {
        String token = request.getHeader("Authorization").substring(7);
        Long purchaserId = jwtUtil.getUserIdFromToken(token);
        rawStoneService.addRawStone(dto, purchaserId);
        return Result.success();
    }

    @PutMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PURCHASER')")
    @OperationLog(module = "原石管理", type = "修改", description = "修改原石信息")
    public Result<Void> updateRawStone(@RequestBody RawStone rawStone) {
        rawStoneService.updateById(rawStone);
        return Result.success();
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'PURCHASER', 'POLISHER')")
    @OperationLog(module = "原石管理", type = "修改", description = "更新原石状态")
    public Result<Void> updateRawStoneStatus(@PathVariable Long id, @RequestParam String status) {
        rawStoneService.updateRawStoneStatus(id, status);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @OperationLog(module = "原石管理", type = "删除", description = "删除原石记录")
    public Result<Void> deleteRawStone(@PathVariable Long id) {
        rawStoneService.removeById(id);
        return Result.success();
    }

    @GetMapping("/{id}")
    @OperationLog(module = "原石管理", type = "查询", description = "获取原石详情")
    public Result<RawStone> getRawStoneById(@PathVariable Long id) {
        RawStone rawStone = rawStoneService.getById(id);
        return Result.success(rawStone);
    }
}
