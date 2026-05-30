package com.logistics.bigcargo.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.logistics.bigcargo.common.Result;
import com.logistics.bigcargo.dto.*;
import com.logistics.bigcargo.entity.DispatchOrder;
import com.logistics.bigcargo.service.DispatchOrderService;
import com.logistics.bigcargo.vo.DispatchStatisticsVO;
import com.logistics.bigcargo.vo.VehicleMatchResultVO;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dispatch-orders")
public class DispatchOrderController {

    @Autowired
    private DispatchOrderService dispatchOrderService;

    @PostMapping
    @PreAuthorize("hasRole('DISPATCHER')")
    public Result<Void> createOrder(@Valid @RequestBody DispatchOrderDTO dto,
                                    @RequestHeader Long operatorId,
                                    @RequestHeader String operatorName) {
        dispatchOrderService.createOrder(dto, operatorId, operatorName);
        return Result.success("工单创建成功", null);
    }

    @PostMapping("/merge-sort")
    @PreAuthorize("hasRole('DISPATCHER')")
    public Result<Void> mergeSort(@Valid @RequestBody MergeSortDTO dto,
                                  @RequestHeader Long operatorId,
                                  @RequestHeader String operatorName) {
        dispatchOrderService.mergeSort(dto, operatorId, operatorName);
        return Result.success("合并分拣成功", null);
    }

    @PutMapping("/{orderId}/complete-sort")
    @PreAuthorize("hasAnyRole('SORTER', 'DISPATCHER')")
    public Result<Void> completeSort(@PathVariable Long orderId,
                                     @RequestHeader Long operatorId,
                                     @RequestHeader String operatorName) {
        dispatchOrderService.completeSort(orderId, operatorId, operatorName);
        return Result.success("分拣完成", null);
    }

    @PostMapping("/smart-match-vehicle")
    @PreAuthorize("hasRole('DISPATCHER')")
    public Result<VehicleMatchResultVO> smartMatchVehicle(@Valid @RequestBody VehicleMatchDTO dto) {
        return Result.success(dispatchOrderService.smartMatchVehicle(dto));
    }

    @PostMapping("/transit-track")
    @PreAuthorize("hasAnyRole('DRIVER', 'DISPATCHER')")
    public Result<Void> updateTransitTrack(@Valid @RequestBody TransitTrackDTO dto,
                                           @RequestHeader Long operatorId,
                                           @RequestHeader String operatorName) {
        dispatchOrderService.updateTransitTrack(dto, operatorId, operatorName);
        return Result.success("轨迹更新成功", null);
    }

    @PostMapping("/sign-verify")
    @PreAuthorize("hasAnyRole('DRIVER', 'DISPATCHER')")
    public Result<Void> signVerify(@Valid @RequestBody SignVerifyDTO dto,
                                   @RequestHeader Long operatorId,
                                   @RequestHeader String operatorName) {
        dispatchOrderService.signVerify(dto, operatorId, operatorName);
        return Result.success("签收核验完成", null);
    }

    @PutMapping("/{orderId}/status/{targetStatus}")
    @PreAuthorize("hasAnyRole('WAREHOUSE_ADMIN', 'SORTER', 'DISPATCHER', 'DRIVER')")
    public Result<Void> updateOrderStatus(@PathVariable Long orderId,
                                          @PathVariable Integer targetStatus,
                                          @RequestHeader Long operatorId,
                                          @RequestHeader String operatorName) {
        dispatchOrderService.updateOrderStatus(orderId, targetStatus, operatorId, operatorName);
        return Result.success("状态更新成功", null);
    }

    @PutMapping("/{orderId}/assign-vehicle")
    @PreAuthorize("hasRole('DISPATCHER')")
    public Result<Void> assignVehicle(@PathVariable Long orderId,
                                      @RequestParam Long vehicleId,
                                      @RequestParam Long driverId,
                                      @RequestHeader Long operatorId,
                                      @RequestHeader String operatorName) {
        dispatchOrderService.assignVehicle(orderId, vehicleId, driverId, operatorId, operatorName);
        return Result.success("派单成功", null);
    }

    @PutMapping("/{orderId}/assign-sorter")
    @PreAuthorize("hasRole('DISPATCHER')")
    public Result<Void> assignSorter(@PathVariable Long orderId,
                                     @RequestParam Long sorterId,
                                     @RequestHeader Long operatorId,
                                     @RequestHeader String operatorName) {
        dispatchOrderService.assignSorter(orderId, sorterId, operatorId, operatorName);
        return Result.success("分拣指派成功", null);
    }

    @GetMapping("/{id}")
    public Result<DispatchOrder> getOrderById(@PathVariable Long id) {
        return Result.success(dispatchOrderService.getOrderById(id));
    }

    @GetMapping("/page")
    public Result<Page<DispatchOrder>> getOrderPage(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) Integer orderStatus,
            @RequestParam(required = false) Long driverId,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long sorterId,
            @RequestParam(required = false) String customerName,
            @RequestParam(required = false) String orderNo) {
        return Result.success(dispatchOrderService.getOrderPage(pageNum, pageSize, orderStatus, driverId,
                categoryId, sorterId, customerName, orderNo));
    }

    @GetMapping("/statistics")
    @PreAuthorize("hasAnyRole('WAREHOUSE_ADMIN', 'DISPATCHER')")
    public Result<DispatchStatisticsVO> getStatistics() {
        return Result.success(dispatchOrderService.getStatistics());
    }

    @PostMapping("/query")
    public Result<Page<DispatchOrder>> queryOrderPage(@RequestBody DispatchOrderQueryDTO dto) {
        return Result.success(dispatchOrderService.queryOrderPage(dto));
    }
}
