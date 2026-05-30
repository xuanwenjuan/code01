package com.fishing.distribution.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.fishing.distribution.annotation.OperationLogger;
import com.fishing.distribution.common.Result;
import com.fishing.distribution.dto.PageQuery;
import com.fishing.distribution.dto.SortingLossRecordDTO;
import com.fishing.distribution.dto.SortingOrderDTO;
import com.fishing.distribution.entity.FishCategory;
import com.fishing.distribution.service.FishCategoryService;
import com.fishing.distribution.service.SortingOrderService;
import com.fishing.distribution.vo.SortingOrderVO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/sorting-order")
@RequiredArgsConstructor
public class SortingOrderController {

    private final SortingOrderService sortingOrderService;
    private final FishCategoryService fishCategoryService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'DISPATCHER')")
    @OperationLogger(module = "分拣工单", type = "新增", desc = "创建分拣工单")
    public Result<Void> createOrder(@Valid @RequestBody SortingOrderDTO dto) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Long userId = (Long) auth.getDetails();
        String username = auth.getName();
        sortingOrderService.createOrder(dto, userId, username);
        return Result.success("创建成功");
    }

    @PutMapping("/{id}/assign-team")
    @PreAuthorize("hasAnyRole('ADMIN', 'DISPATCHER')")
    @OperationLogger(module = "分拣工单", type = "分配", desc = "分配分拣班组")
    public Result<Void> assignTeam(@PathVariable Long id, @RequestParam Long teamId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Long userId = (Long) auth.getDetails();
        sortingOrderService.assignTeam(id, teamId, userId);
        return Result.success("分配成功");
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'DISPATCHER', 'SORTER')")
    @OperationLogger(module = "分拣工单", type = "状态变更", desc = "更新工单状态")
    public Result<Void> updateOrderStatus(@PathVariable Long id, @RequestParam Integer status) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Long userId = (Long) auth.getDetails();
        String username = auth.getName();
        sortingOrderService.updateOrderStatus(id, status, userId, username);
        return Result.success("状态更新成功");
    }

    @PutMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('ADMIN', 'DISPATCHER')")
    @OperationLogger(module = "分拣工单", type = "取消", desc = "取消分拣工单")
    public Result<Void> cancelOrder(@PathVariable Long id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Long userId = (Long) auth.getDetails();
        String username = auth.getName();
        sortingOrderService.cancelOrder(id, userId, username);
        return Result.success("取消成功");
    }

    @PostMapping("/loss-record")
    @PreAuthorize("hasAnyRole('ADMIN', 'SORTER')")
    @OperationLogger(module = "分拣工单", type = "损耗登记", desc = "登记分拣损耗")
    public Result<Void> recordLoss(@Valid @RequestBody SortingLossRecordDTO dto) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Long userId = (Long) auth.getDetails();
        String username = auth.getName();
        sortingOrderService.recordLoss(dto, userId, username);
        return Result.success("损耗登记成功");
    }

    @GetMapping("/{id}")
    public Result<SortingOrderVO> getOrderById(@PathVariable Long id) {
        return Result.success(sortingOrderService.getOrderById(id));
    }

    @GetMapping("/page")
    public Result<IPage<SortingOrderVO>> getOrderPage(
            PageQuery pageQuery,
            @RequestParam(required = false) Long boatId,
            @RequestParam(required = false) Integer status,
            @RequestParam(required = false) Long teamId) {
        return Result.success(sortingOrderService.getOrderPage(pageQuery, boatId, status, teamId));
    }

    @GetMapping("/timeout")
    @PreAuthorize("hasAnyRole('ADMIN', 'DISPATCHER')")
    public Result<List<SortingOrderVO>> getTimeoutOrders(
            @RequestParam(defaultValue = "4") Integer hours) {
        return Result.success(sortingOrderService.getTimeoutOrders(hours));
    }

    @GetMapping("/hot-categories")
    public Result<List<FishCategory>> getHotCategories() {
        return Result.success(fishCategoryService.getHotCategories());
    }
}
