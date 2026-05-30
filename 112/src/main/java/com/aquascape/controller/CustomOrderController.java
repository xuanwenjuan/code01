package com.aquascape.controller;

import com.aquascape.annotation.OperationLog;
import com.aquascape.annotation.RequiresRole;
import com.aquascape.common.Result;
import com.aquascape.dto.CustomOrderDTO;
import com.aquascape.entity.CustomOrder;
import com.aquascape.service.CustomOrderService;
import com.aquascape.vo.CustomOrderVO;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/order")
public class CustomOrderController {

    @Autowired
    private CustomOrderService orderService;

    @GetMapping("/page")
    @RequiresRole({"ADMIN", "SCAPER"})
    public Result<Page<CustomOrderVO>> page(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String customerName,
            @RequestParam(required = false) Integer orderStatus,
            @RequestParam(required = false) Long scaperId) {
        return Result.success(orderService.page(page, size, customerName, orderStatus, scaperId));
    }

    @GetMapping
    @RequiresRole({"ADMIN", "SCAPER"})
    public Result<List<CustomOrder>> list() {
        return Result.success(orderService.list());
    }

    @GetMapping("/{id}")
    @RequiresRole({"ADMIN", "SCAPER"})
    public Result<CustomOrderVO> getDetail(@PathVariable Long id) {
        return Result.success(orderService.getDetailVO(id));
    }

    @PostMapping
    @RequiresRole({"ADMIN", "SCAPER"})
    @OperationLog(module = "造景工单", operation = "创建工单")
    public Result<Void> create(@Valid @RequestBody CustomOrderDTO dto) {
        orderService.create(dto);
        return Result.success();
    }

    @PutMapping("/{id}")
    @RequiresRole({"ADMIN", "SCAPER"})
    @OperationLog(module = "造景工单", operation = "编辑工单")
    public Result<Void> update(@PathVariable Long id, @Valid @RequestBody CustomOrderDTO dto) {
        orderService.update(id, dto);
        return Result.success();
    }

    @PutMapping("/{id}/confirmScheme")
    @RequiresRole({"ADMIN", "SCAPER"})
    @OperationLog(module = "造景工单", operation = "确认方案")
    public Result<Void> confirmScheme(@PathVariable Long id, @RequestBody(required = false) String designScheme) {
        orderService.confirmScheme(id, designScheme);
        return Result.success();
    }

    @PutMapping("/{id}/startBuild")
    @RequiresRole({"ADMIN", "SCAPER"})
    @OperationLog(module = "造景工单", operation = "开始搭建")
    public Result<Void> startBuild(@PathVariable Long id) {
        orderService.startBuild(id);
        return Result.success();
    }

    @PutMapping("/{id}/completeBuild")
    @RequiresRole({"ADMIN", "SCAPER"})
    @OperationLog(module = "造景工单", operation = "完成搭建")
    public Result<Void> completeBuild(@PathVariable Long id) {
        orderService.completeBuild(id);
        return Result.success();
    }

    @PutMapping("/{id}/deliver")
    @RequiresRole({"ADMIN", "SCAPER"})
    @OperationLog(module = "造景工单", operation = "交付工单")
    public Result<Void> deliver(@PathVariable Long id) {
        orderService.deliver(id);
        return Result.success();
    }

    @PutMapping("/{id}/cancel")
    @RequiresRole({"ADMIN"})
    @OperationLog(module = "造景工单", operation = "取消工单")
    public Result<Void> cancelOrder(@PathVariable Long id) {
        orderService.cancelOrder(id);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    @RequiresRole({"ADMIN"})
    @OperationLog(module = "造景工单", operation = "删除工单")
    public Result<Void> delete(@PathVariable Long id) {
        orderService.delete(id);
        return Result.success();
    }
}
