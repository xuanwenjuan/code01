package com.household.management.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.household.management.common.annotation.OperationLog;
import com.household.management.common.entity.PageQuery;
import com.household.management.common.result.Result;
import com.household.management.entity.FinishedProductInbound;
import com.household.management.entity.FinishedProductStock;
import com.household.management.mapper.FinishedProductStockMapper;
import com.household.management.service.FinishedProductInboundService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "成品入库管理")
@RestController
@RequestMapping("/finished-product/inbound")
public class FinishedProductInboundController {

    private final FinishedProductInboundService inboundService;
    private final FinishedProductStockMapper stockMapper;

    public FinishedProductInboundController(FinishedProductInboundService inboundService,
                                            FinishedProductStockMapper stockMapper) {
        this.inboundService = inboundService;
        this.stockMapper = stockMapper;
    }

    @GetMapping("/page")
    @Operation(summary = "分页查询入库单列表")
    public Result<IPage<FinishedProductInbound>> page(PageQuery pageQuery,
                                                       @RequestParam(required = false) Integer status,
                                                       @RequestParam(required = false) Long productId) {
        return Result.success(inboundService.page(pageQuery, status, productId));
    }

    @GetMapping("/list")
    @Operation(summary = "获取入库单列表")
    public Result<List<FinishedProductInbound>> list() {
        return Result.success(inboundService.list());
    }

    @GetMapping("/{id}")
    @Operation(summary = "获取入库单详情")
    public Result<FinishedProductInbound> getById(@PathVariable Long id) {
        return Result.success(inboundService.getById(id));
    }

    @GetMapping("/stock/list")
    @Operation(summary = "获取成品库存列表")
    public Result<List<FinishedProductStock>> getStockList() {
        return Result.success(stockMapper.selectStockListWithProduct());
    }

    @PostMapping
    @Operation(summary = "创建成品入库单")
    @OperationLog(module = "成品入库管理", operation = "创建入库单")
    public Result<Void> createInbound(@Valid @RequestBody FinishedProductInbound inbound) {
        inboundService.createInbound(inbound);
        return Result.success();
    }

    @PutMapping
    @Operation(summary = "更新入库单")
    @OperationLog(module = "成品入库管理", operation = "更新入库单")
    public Result<Void> updateInbound(@Valid @RequestBody FinishedProductInbound inbound) {
        inboundService.updateInbound(inbound);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "删除入库单")
    @OperationLog(module = "成品入库管理", operation = "删除入库单")
    public Result<Void> deleteInbound(@PathVariable Long id) {
        inboundService.deleteInbound(id);
        return Result.success();
    }

    @PutMapping("/{id}/audit")
    @Operation(summary = "审核入库单")
    @OperationLog(module = "成品入库管理", operation = "审核入库单")
    public Result<Void> auditInbound(@PathVariable Long id,
                                     @RequestParam boolean passed,
                                     @RequestParam(required = false) String remark,
                                     HttpServletRequest request) {
        Long auditorId = (Long) request.getAttribute("currentUserId");
        inboundService.auditInbound(id, auditorId, passed, remark);
        return Result.success();
    }
}
