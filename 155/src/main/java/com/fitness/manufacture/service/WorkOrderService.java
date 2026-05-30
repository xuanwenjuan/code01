package com.fitness.manufacture.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import com.fitness.manufacture.common.PageQuery;
import com.fitness.manufacture.dto.WorkOrderDTO;
import com.fitness.manufacture.dto.WorkOrderQueryDTO;
import com.fitness.manufacture.entity.WorkOrder;

import java.util.List;

public interface WorkOrderService extends IService<WorkOrder> {

    void saveWorkOrder(WorkOrderDTO dto);

    void updateWorkOrder(WorkOrderDTO dto);

    void deleteWorkOrder(Long id);

    IPage<WorkOrder> getWorkOrderPage(PageQuery query, Long productId, Integer status, Long lineLeaderId);

    IPage<WorkOrder> getWorkOrderPageByConditions(WorkOrderQueryDTO queryDTO);

    void updateWorkOrderStatus(Long id, Integer status, String remark);

    void auditWorkOrder(Long id, Integer auditResult, String remark);

    void startWorkOrder(Long id);

    void pauseWorkOrder(Long id, String reason);

    void resumeWorkOrder(Long id);

    void completeWorkOrder(Long id);

    void cancelWorkOrder(Long id, String reason);

    void assignWorkOrder(Long id, Long lineLeaderId);

    String generateWorkOrderNo();

    void autoFreezeWorkOrders();

    List<WorkOrder> getWorkOrderList(Long productId, Integer status);
}
