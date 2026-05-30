package com.household.management.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.household.management.common.annotation.OperationLog;
import com.household.management.common.entity.PageQuery;
import com.household.management.common.result.Result;
import com.household.management.entity.RawMaterialInbound;
import com.household.management.service.RawMaterialInboundService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "原料入库管理")
@RestController
@RequestMapping("/raw-material/inbound")
public class RawMaterialInboundController {

    private final RawMaterialInboundService inboundService;

    public RawMaterialInboundController(RawMaterialInboundService inboundService) {
        this.inboundService = inboundService;
    }

    @GetMapping("/page")
    @Operation(summary = "分页查询入库单列表")
    public Result<IPage<RawMaterialInbound>> page(PageQuery pageQuery,
                                                   @RequestParam(required = false) Integer status,
                                                   @RequestParam(required = false) Long materialId) {
        return Result.success(inboundService.page(pageQuery, status, materialId));
    }

    @GetMapping("/list")
    @Operation(summary = "获取入库单列表")
    public Result<List<RawMaterialInbound>> list() {
        return Result.success(inboundService.list());
    }

    @GetMapping("/{id}")
    @Operation(summary = "获取入库单详情")
    public Result<RawMaterialInbound> getById(@PathVariable Long id) {
        return Result.success(inboundService.getById(id));
    }

    @PostMapping
    @Operation(summary = "创建原料入库单")
    @OperationLog(module = "原料入库管理", operation = "创建入库单")
    public Result<Void> createInbound(@Valid @RequestBody RawMaterialInbound inbound) {
        inboundService.createInbound(inbound);
        return Result.success();
    }

    @PutMapping
    @Operation(summary = "更新入库单")
    @OperationLog(module = "原料入库管理", operation = "更新入库单")
    public Result<Void> updateInbound(@Valid @RequestBody RawMaterialInbound inbound) {
        inboundService.updateInbound(inbound);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "删除入库单")
    @OperationLog(module = "原料入库管理", operation = "删除入库单")
    public Result<Void> deleteInbound(@PathVariable Long id) {
        inboundService.deleteInbound(id);
        return Result.success();
    }

    @PutMapping("/{id}/audit")
    @Operation(summary = "审核入库单")
    @OperationLog(module = "原料入库管理", operation = "审核入库单")
    public Result<Void> auditInbound(@PathVariable Long id,
                                     @RequestParam boolean passed,
                                     @RequestParam(required = false) String remark,
                                     HttpServletRequest request) {
        Long auditorId = (Long) request.getAttribute("currentUserId");
        inboundService.auditInbound(id, auditorId, passed, remark);
        return Result.success();
    }
}
