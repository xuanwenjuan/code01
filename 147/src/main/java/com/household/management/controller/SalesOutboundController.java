package com.household.management.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.household.management.common.annotation.OperationLog;
import com.household.management.common.entity.PageQuery;
import com.household.management.common.result.Result;
import com.household.management.entity.SalesOutbound;
import com.household.management.entity.SalesOutboundDetail;
import com.household.management.service.SalesOutboundService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Tag(name = "销售出库管理")
@RestController
@RequestMapping("/sales/outbound")
public class SalesOutboundController {

    private final SalesOutboundService outboundService;

    public SalesOutboundController(SalesOutboundService outboundService) {
        this.outboundService = outboundService;
    }

    @GetMapping("/page")
    @Operation(summary = "分页查询出库单列表")
    public Result<IPage<SalesOutbound>> page(PageQuery pageQuery,
                                              @RequestParam(required = false) Integer status,
                                              @RequestParam(required = false) Long customerId) {
        return Result.success(outboundService.page(pageQuery, status, customerId));
    }

    @GetMapping("/list")
    @Operation(summary = "获取出库单列表")
    public Result<List<SalesOutbound>> list() {
        return Result.success(outboundService.list());
    }

    @GetMapping("/{id}")
    @Operation(summary = "获取出库单详情")
    public Result<SalesOutbound> getById(@PathVariable Long id) {
        return Result.success(outboundService.getById(id));
    }

    @PostMapping
    @Operation(summary = "创建销售出库单")
    @OperationLog(module = "销售出库管理", operation = "创建出库单")
    public Result<Void> createOutbound(@Valid @RequestBody Map<String, Object> request) {
        SalesOutbound outbound = new SalesOutbound();
        outbound.setCustomerId(Long.valueOf(request.get("customerId").toString()));
        if (request.get("orderId") != null) {
            outbound.setOrderId(Long.valueOf(request.get("orderId").toString()));
        }
        outbound.setDeliveryPerson((String) request.get("deliveryPerson"));
        outbound.setRemark((String) request.get("remark"));

        List<Map<String, Object>> detailMaps = (List<Map<String, Object>>) request.get("details");
        List<SalesOutboundDetail> details = detailMaps.stream().map(map -> {
            SalesOutboundDetail detail = new SalesOutboundDetail();
            detail.setProductId(Long.valueOf(map.get("productId").toString()));
            detail.setQuantity(Integer.valueOf(map.get("quantity").toString()));
            if (map.get("unitPrice") != null) {
                detail.setUnitPrice(new java.math.BigDecimal(map.get("unitPrice").toString()));
            }
            return detail;
        }).toList();

        outboundService.createOutbound(outbound, details);
        return Result.success();
    }

    @PutMapping
    @Operation(summary = "更新销售出库单")
    @OperationLog(module = "销售出库管理", operation = "更新出库单")
    public Result<Void> updateOutbound(@Valid @RequestBody Map<String, Object> request) {
        SalesOutbound outbound = new SalesOutbound();
        outbound.setId(Long.valueOf(request.get("id").toString()));
        outbound.setCustomerId(Long.valueOf(request.get("customerId").toString()));
        if (request.get("orderId") != null) {
            outbound.setOrderId(Long.valueOf(request.get("orderId").toString()));
        }
        outbound.setDeliveryPerson((String) request.get("deliveryPerson"));
        outbound.setRemark((String) request.get("remark"));

        List<Map<String, Object>> detailMaps = (List<Map<String, Object>>) request.get("details");
        List<SalesOutboundDetail> details = detailMaps.stream().map(map -> {
            SalesOutboundDetail detail = new SalesOutboundDetail();
            detail.setProductId(Long.valueOf(map.get("productId").toString()));
            detail.setQuantity(Integer.valueOf(map.get("quantity").toString()));
            if (map.get("unitPrice") != null) {
                detail.setUnitPrice(new java.math.BigDecimal(map.get("unitPrice").toString()));
            }
            return detail;
        }).toList();

        outboundService.updateOutbound(outbound, details);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "删除出库单")
    @OperationLog(module = "销售出库管理", operation = "删除出库单")
    public Result<Void> deleteOutbound(@PathVariable Long id) {
        outboundService.deleteOutbound(id);
        return Result.success();
    }

    @PutMapping("/{id}/audit")
    @Operation(summary = "审核出库单")
    @OperationLog(module = "销售出库管理", operation = "审核出库单")
    public Result<Void> auditOutbound(@PathVariable Long id,
                                      @RequestParam boolean passed,
                                      @RequestParam(required = false) String remark,
                                      HttpServletRequest request) {
        Long auditorId = (Long) request.getAttribute("currentUserId");
        outboundService.auditOutbound(id, auditorId, passed, remark);
        return Result.success();
    }
}
