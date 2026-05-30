package com.paper.production.service.workorder;

import com.baomidou.mybatisplus.extension.service.IService;
import com.paper.production.common.PageQuery;
import com.paper.production.common.PageResult;
import com.paper.production.dto.workorder.WorkOrderConfirmDTO;
import com.paper.production.dto.workorder.WorkOrderDTO;
import com.paper.production.dto.workorder.WorkOrderProcessDTO;
import com.paper.production.entity.workorder.WorkOrder;
import com.paper.production.entity.workorder.WorkOrderMaterial;
import com.paper.production.entity.workorder.WorkOrderProcess;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public interface WorkOrderService extends IService<WorkOrder> {

    void createWorkOrder(WorkOrderDTO dto);

    void updateWorkOrder(WorkOrderDTO dto);

    void deleteWorkOrder(Long id);

    PageResult<WorkOrder> queryWorkOrderPage(PageQuery query);

    void scheduleWorkOrder(Long id);

    void startProcess(WorkOrderProcessDTO dto);

    void finishProcess(WorkOrderProcessDTO dto);

    void cancelWorkOrder(Long id);

    List<WorkOrderProcess> getWorkOrderProcesses(Long workOrderId);

    void checkAndSuspendExpiredOrders();

    List<WorkOrderMaterial> getWorkOrderMaterials(Long workOrderId);

    List<WorkOrder> listByStatus(Integer status);

    List<WorkOrder> getPendingOrders();

    List<WorkOrder> getProcessingOrders();

    List<WorkOrder> getFinishedOrders(LocalDate startDate, LocalDate endDate);

    Map<String, Object> getWorkOrderStatistics();

    Map<String, Object> getDailyStatistics(LocalDate date);

    Map<String, Object> getProductionEfficiency();

    List<Map<String, Object>> getProcessProgress(Long workOrderId);

    void updateWorkOrderPriority(Long id, Integer priority);

    void batchSchedule(List<Long> ids);

    PageResult<WorkOrder> queryByStatusPage(Integer status, PageQuery query);

    void confirmWorkOrder(WorkOrderConfirmDTO dto);
}
