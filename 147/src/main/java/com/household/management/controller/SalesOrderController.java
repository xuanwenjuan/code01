package com.household.management.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.household.management.common.annotation.OperationLog;
import com.household.management.common.entity.PageQuery;
import com.household.management.common.result.Result;
import com.household.management.entity.Customer;
import com.household.management.entity.SalesOrder;
import com.household.management.entity.SalesOrderDetail;
import com.household.management.mapper.CustomerMapper;
import com.household.management.service.SalesOrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Tag(name = "销售订单管理")
@RestController
@RequestMapping("/sales/order")
public class SalesOrderController {

    private final SalesOrderService orderService;
    private final CustomerMapper customerMapper;

    public SalesOrderController(SalesOrderService orderService, CustomerMapper customerMapper) {
        this.orderService = orderService;
        this.customerMapper = customerMapper;
    }

    @GetMapping("/page")
    @Operation(summary = "分页查询订单列表")
    public Result<IPage<SalesOrder>> page(PageQuery pageQuery,
                                           @RequestParam(required = false) Integer status,
                                           @RequestParam(required = false) Long customerId) {
        return Result.success(orderService.page(pageQuery, status, customerId));
    }

    @GetMapping("/list")
    @Operation(summary = "获取订单列表")
    public Result<List<SalesOrder>> list() {
        return Result.success(orderService.list());
    }

    @GetMapping("/{id}")
    @Operation(summary = "获取订单详情")
    public Result<SalesOrder> getById(@PathVariable Long id) {
        return Result.success(orderService.getById(id));
    }

    @GetMapping("/customer/list")
    @Operation(summary = "获取客户列表")
    public Result<List<Customer>> getCustomerList() {
        return Result.success(customerMapper.selectList(null));
    }

    @PostMapping
    @Operation(summary = "创建销售订单")
    @OperationLog(module = "销售订单管理", operation = "创建订单")
    public Result<Void> createOrder(@Valid @RequestBody Map<String, Object> request) {
        SalesOrder order = new SalesOrder();
        order.setCustomerId(Long.valueOf(request.get("customerId").toString()));
        order.setDeliveryDate(java.time.LocalDate.parse(request.get("deliveryDate").toString()));
        order.setDeliveryAddress((String) request.get("deliveryAddress"));
        order.setRemark((String) request.get("remark"));
        if (request.get("priority") != null) {
            order.setPriority(Integer.valueOf(request.get("priority").toString()));
        }

        List<Map<String, Object>> detailMaps = (List<Map<String, Object>>) request.get("details");
        List<SalesOrderDetail> details = detailMaps.stream().map(map -> {
            SalesOrderDetail detail = new SalesOrderDetail();
            detail.setProductId(Long.valueOf(map.get("productId").toString()));
            detail.setQuantity(Integer.valueOf(map.get("quantity").toString()));
            if (map.get("unitPrice") != null) {
                detail.setUnitPrice(new java.math.BigDecimal(map.get("unitPrice").toString()));
            }
            return detail;
        }).toList();

        orderService.createOrder(order, details);
        return Result.success();
    }

    @PutMapping
    @Operation(summary = "更新销售订单")
    @OperationLog(module = "销售订单管理", operation = "更新订单")
    public Result<Void> updateOrder(@Valid @RequestBody Map<String, Object> request) {
        SalesOrder order = new SalesOrder();
        order.setId(Long.valueOf(request.get("id").toString()));
        order.setCustomerId(Long.valueOf(request.get("customerId").toString()));
        order.setDeliveryDate(java.time.LocalDate.parse(request.get("deliveryDate").toString()));
        order.setDeliveryAddress((String) request.get("deliveryAddress"));
        order.setRemark((String) request.get("remark"));
        if (request.get("priority") != null) {
            order.setPriority(Integer.valueOf(request.get("priority").toString()));
        }

        List<Map<String, Object>> detailMaps = (List<Map<String, Object>>) request.get("details");
        List<SalesOrderDetail> details = detailMaps.stream().map(map -> {
            SalesOrderDetail detail = new SalesOrderDetail();
            detail.setProductId(Long.valueOf(map.get("productId").toString()));
            detail.setQuantity(Integer.valueOf(map.get("quantity").toString()));
            if (map.get("unitPrice") != null) {
                detail.setUnitPrice(new java.math.BigDecimal(map.get("unitPrice").toString()));
            }
            return detail;
        }).toList();

        orderService.updateOrder(order, details);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "删除订单")
    @OperationLog(module = "销售订单管理", operation = "删除订单")
    public Result<Void> deleteOrder(@PathVariable Long id) {
        orderService.deleteOrder(id);
        return Result.success();
    }

    @PutMapping("/{id}/confirm")
    @Operation(summary = "确认订单")
    @OperationLog(module = "销售订单管理", operation = "确认订单")
    public Result<Void> confirmOrder(@PathVariable Long id) {
        orderService.confirmOrder(id);
        return Result.success();
    }

    @PutMapping("/{id}/cancel")
    @Operation(summary = "取消订单")
    @OperationLog(module = "销售订单管理", operation = "取消订单")
    public Result<Void> cancelOrder(@PathVariable Long id, @RequestParam(required = false) String reason) {
        orderService.cancelOrder(id, reason);
        return Result.success();
    }

    @PutMapping("/{id}/complete")
    @Operation(summary = "完成订单")
    @OperationLog(module = "销售订单管理", operation = "完成订单")
    public Result<Void> completeOrder(@PathVariable Long id) {
        orderService.completeOrder(id);
        return Result.success();
    }
}
