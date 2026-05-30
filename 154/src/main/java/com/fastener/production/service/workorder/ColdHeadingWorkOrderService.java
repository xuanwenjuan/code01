package com.fastener.production.service.workorder;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import com.fastener.production.common.entity.PageQuery;
import com.fastener.production.entity.workorder.ColdHeadingWorkOrder;
import com.fastener.production.entity.workorder.WorkOrderProcess;
import com.fastener.production.entity.workorder.dto.ColdHeadingWorkOrderDTO;
import com.fastener.production.entity.workorder.dto.ProcessCompleteDTO;
import com.fastener.production.entity.workorder.dto.ProcessStartDTO;
import com.fastener.production.entity.workorder.dto.WorkOrderAuditDTO;

import java.math.BigDecimal;
import java.util.List;

public interface ColdHeadingWorkOrderService extends IService<ColdHeadingWorkOrder> {

    IPage<ColdHeadingWorkOrder> page(PageQuery pageQuery, String orderNo, Long categoryId, Integer status, Integer auditStatus);

    String generateOrderNo();

    void create(ColdHeadingWorkOrderDTO dto);

    void audit(WorkOrderAuditDTO dto);

    void startProcess(ProcessStartDTO dto);

    void completeProcess(ProcessCompleteDTO dto);

    void startWorkOrder(Long id);

    void cancelWorkOrder(Long id);

    void freezeWorkOrder(Long id);

    List<WorkOrderProcess> getProcessList(Long workOrderId);

    void reserveMaterial(Long workOrderId, Long batchId, BigDecimal quantity);

    void releaseMaterial(Long workOrderId);

    void autoReserveMaterial(Long workOrderId);
}
