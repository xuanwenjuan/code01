package com.spring.manufacturing.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import com.spring.manufacturing.dto.DefectiveProcessDTO;
import com.spring.manufacturing.dto.ProcessCompleteDTO;
import com.spring.manufacturing.dto.WorkOrderCreateDTO;
import com.spring.manufacturing.entity.ProductionWorkOrder;
import com.spring.manufacturing.entity.WorkOrderProcess;

import java.util.List;

public interface ProductionWorkOrderService extends IService<ProductionWorkOrder> {

    Long createWorkOrder(WorkOrderCreateDTO dto, Long operatorId);

    void startProcess(Long workOrderId, String processCode, Long operatorId);

    void completeProcess(ProcessCompleteDTO dto, Long operatorId);

    void processDefective(DefectiveProcessDTO dto, Long operatorId);

    void pauseWorkOrder(Long workOrderId, Long operatorId);

    void resumeWorkOrder(Long workOrderId, Long operatorId);

    IPage<ProductionWorkOrder> getWorkOrderPage(int page, int size, String status, Long categoryId);

    List<WorkOrderProcess> getWorkOrderProcesses(Long workOrderId);

    void calculateFinalCost(Long workOrderId, Long operatorId);
}