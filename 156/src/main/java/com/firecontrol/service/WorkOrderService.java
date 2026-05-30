package com.firecontrol.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.firecontrol.common.PageQuery;
import com.firecontrol.dto.ProcessOperationDTO;
import com.firecontrol.dto.WorkOrderDTO;
import com.firecontrol.dto.WorkOrderPickMaterialDTO;
import com.firecontrol.entity.WorkOrder;
import com.firecontrol.entity.WorkOrderMaterial;
import com.firecontrol.entity.WorkOrderProcess;
import com.firecontrol.vo.WorkOrderProgressVO;

import java.util.List;

public interface WorkOrderService {

    String createWorkOrder(WorkOrderDTO dto);

    void updateWorkOrder(WorkOrderDTO dto);

    void deleteWorkOrder(Long id);

    WorkOrder getWorkOrderById(Long id);

    IPage<WorkOrder> getWorkOrderPage(WorkOrder workOrder, PageQuery pageQuery);

    void startProcess(ProcessOperationDTO dto);

    void completeProcess(ProcessOperationDTO dto);

    void pauseWorkOrder(Long id, String reason);

    void resumeWorkOrder(Long id);

    void cancelWorkOrder(Long id, String reason);

    List<WorkOrderProcess> getWorkOrderProcesses(Long workOrderId);

    List<WorkOrderMaterial> getWorkOrderMaterials(Long workOrderId);

    void autoPauseOverdueOrders();

    void pickMaterial(WorkOrderPickMaterialDTO dto);

    void returnMaterial(WorkOrderPickMaterialDTO dto);

    WorkOrderProgressVO getWorkOrderProgress(Long workOrderId);

    List<WorkOrder> searchWorkOrders(String keyword, Integer status, String productCategory);

    void approveWorkOrder(Long id, String remark);

    void rejectWorkOrder(Long id, String remark);

    void addLaborRecord(WorkOrderLabor labor);

    List<WorkOrderLabor> getWorkOrderLabors(Long workOrderId);
}
