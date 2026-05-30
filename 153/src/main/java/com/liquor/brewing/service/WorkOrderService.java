package com.liquor.brewing.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import com.liquor.brewing.common.PageQuery;
import com.liquor.brewing.dto.WorkOrderMaterialPickDTO;
import com.liquor.brewing.dto.WorkOrderQueryDTO;
import com.liquor.brewing.entity.WorkOrder;
import com.liquor.brewing.entity.WorkOrderMaterial;
import com.liquor.brewing.entity.WorkOrderProcess;

import java.util.List;

public interface WorkOrderService extends IService<WorkOrder> {

    IPage<WorkOrder> page(String keyword, Long categoryId, Integer status, PageQuery pageQuery);

    IPage<WorkOrder> pageByCondition(WorkOrderQueryDTO query, PageQuery pageQuery);

    WorkOrder detail(Long id);

    void create(WorkOrder workOrder);

    void startProcess(Long id, Integer processType);

    void finishProcess(Long id, Integer processType, WorkOrderProcess process);

    void start(Long id);

    void finish(Long id);

    void freeze(Long id);

    void unfreeze(Long id);

    void cancel(Long id);

    void autoFreezeWorkOrders();

    void pickMaterial(WorkOrderMaterialPickDTO dto);

    void returnMaterial(WorkOrderMaterialPickDTO dto);

    List<WorkOrderMaterial> getOrderMaterials(Long workOrderId);

    void updateActualQuantity(Long workOrderId, Long materialId, java.math.BigDecimal actualQuantity);
}
