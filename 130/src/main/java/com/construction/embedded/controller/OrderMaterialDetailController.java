package com.construction.embedded.controller;

import com.construction.embedded.common.Result;
import com.construction.embedded.entity.OrderMaterialDetail;
import com.construction.embedded.service.OrderMaterialDetailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/order-detail")
public class OrderMaterialDetailController {

    @Autowired
    private OrderMaterialDetailService orderMaterialDetailService;

    @GetMapping("/order/{orderId}")
    public Result<List<OrderMaterialDetail>> getByOrderId(@PathVariable Long orderId) {
        List<OrderMaterialDetail> list = orderMaterialDetailService.getByOrderId(orderId);
        return Result.success(list);
    }

    @PostMapping
    public Result<Void> addDetail(@RequestBody OrderMaterialDetail detail) {
        orderMaterialDetailService.addDetail(detail);
        return Result.success("添加成功", null);
    }

    @PutMapping
    public Result<Void> updateDetail(@RequestBody OrderMaterialDetail detail) {
        orderMaterialDetailService.updateDetail(detail);
        return Result.success("更新成功", null);
    }

    @DeleteMapping("/{id}")
    public Result<Void> deleteDetail(@PathVariable Long id) {
        orderMaterialDetailService.deleteDetail(id);
        return Result.success("删除成功", null);
    }
}
