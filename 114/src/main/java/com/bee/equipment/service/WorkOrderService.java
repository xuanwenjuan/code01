package com.bee.equipment.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.bee.equipment.dto.WorkOrderDTO;
import com.bee.equipment.dto.WorkOrderFinishDTO;
import com.bee.equipment.entity.WorkOrder;
import com.bee.equipment.vo.WorkOrderVO;

import java.math.BigDecimal;
import java.util.Map;

public interface WorkOrderService extends IService<WorkOrder> {

    Page<WorkOrderVO> listWithPage(int page, int size, String status);

    WorkOrderVO getDetail(Long id);

    void createWorkOrder(WorkOrderDTO workOrderDTO);

    void pickMaterial(Long workOrderId, Long userId);

    void startAssembly(Long workOrderId);

    Map<String, Object> finishAssembly(WorkOrderFinishDTO finishDTO);

    void startInspection(Long workOrderId);

    void deliver(Long workOrderId);

    void suspendTimeoutOrders();

    void resumeWorkOrder(Long workOrderId);

    void cancelWorkOrder(Long workOrderId);

    BigDecimal calculateLaborCost(Integer quantity, Long categoryId);

    BigDecimal calculateMaterialLossCost(WorkOrderFinishDTO finishDTO);
}
