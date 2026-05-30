package com.tarp.controller;

import com.tarp.annotation.OperationLog;
import com.tarp.annotation.RequireRole;
import com.tarp.common.RoleConstants;
import com.tarp.dto.WorkOrderConfirmDTO;
import com.tarp.dto.WorkOrderCreateDTO;
import com.tarp.service.WorkOrderService;
import com.tarp.vo.PageVO;
import com.tarp.vo.ResultVO;
import com.tarp.vo.WorkOrderMaterialVO;
import com.tarp.vo.WorkOrderStatusLogVO;
import com.tarp.vo.WorkOrderVO;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/work-order")
@RequiredArgsConstructor
public class WorkOrderController {

    private final WorkOrderService workOrderService;

    @GetMapping("/page")
    public ResultVO<PageVO<WorkOrderVO>> page(
            @RequestParam(defaultValue = "1") int pageNum,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(required = false) Integer status
    ) {
        return ResultVO.success(workOrderService.page(pageNum, pageSize, status));
    }

    @GetMapping("/{id}")
    public ResultVO<WorkOrderVO> getById(@PathVariable Long id) {
        return ResultVO.success(workOrderService.getDetailById(id));
    }

    @GetMapping("/{id}/materials")
    public ResultVO<List<WorkOrderMaterialVO>> getOrderMaterials(@PathVariable Long id) {
        return ResultVO.success(workOrderService.getOrderMaterials(id));
    }

    @GetMapping("/{id}/status-logs")
    public ResultVO<List<WorkOrderStatusLogVO>> getStatusLogs(@PathVariable Long id) {
        return ResultVO.success(workOrderService.getStatusLogs(id));
    }

    @PostMapping
    @OperationLog("创建工单")
    @RequireRole({RoleConstants.ROLE_ADMIN, RoleConstants.ROLE_WAREHOUSE})
    public ResultVO<WorkOrderVO> createWorkOrder(@Valid @RequestBody WorkOrderCreateDTO dto) {
        return ResultVO.success(workOrderService.createWorkOrder(dto));
    }

    @PostMapping("/confirm")
    @OperationLog("确认工单规格并锁定库存")
    @RequireRole({RoleConstants.ROLE_ADMIN, RoleConstants.ROLE_WAREHOUSE})
    public ResultVO<WorkOrderVO> confirmWorkOrder(@Valid @RequestBody WorkOrderConfirmDTO dto) {
        return ResultVO.success(workOrderService.confirmWorkOrder(dto));
    }

    @PostMapping("/{id}/complete")
    @OperationLog("完工并核算成本")
    @RequireRole({RoleConstants.ROLE_ADMIN, RoleConstants.ROLE_WAREHOUSE})
    public ResultVO<WorkOrderVO> completeWorkOrder(
            @PathVariable Long id,
            @RequestParam(required = false) BigDecimal lossRatio,
            HttpServletRequest request
    ) {
        Long userId = (Long) request.getAttribute("userId");
        String username = (String) request.getAttribute("username");
        return ResultVO.success(workOrderService.completeWorkOrder(id, userId, username, lossRatio));
    }

    @PutMapping("/{id}/status")
    @OperationLog("更新工单状态")
    @RequireRole({RoleConstants.ROLE_ADMIN, RoleConstants.ROLE_TAILOR, RoleConstants.ROLE_WAREHOUSE})
    public ResultVO<Void> updateStatus(
            @PathVariable Long id,
            @RequestParam Integer status,
            @RequestParam(required = false) String remark,
            HttpServletRequest request
    ) {
        Long userId = (Long) request.getAttribute("userId");
        String username = (String) request.getAttribute("username");
        workOrderService.updateStatus(id, status, userId, username, remark);
        return ResultVO.success();
    }

    @PutMapping("/{id}/resume")
    @OperationLog("恢复工单")
    @RequireRole({RoleConstants.ROLE_ADMIN, RoleConstants.ROLE_WAREHOUSE})
    public ResultVO<Void> resumeOrder(
            @PathVariable Long id,
            HttpServletRequest request
    ) {
        Long userId = (Long) request.getAttribute("userId");
        String username = (String) request.getAttribute("username");
        workOrderService.resumeOrder(id, userId, username);
        return ResultVO.success();
    }
}
