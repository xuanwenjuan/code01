package com.cosmetics.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.cosmetics.common.PageQuery;
import com.cosmetics.dto.ProcessRecordDTO;
import com.cosmetics.dto.WorkOrderCreateDTO;
import com.cosmetics.dto.WorkOrderMaterialDTO;
import com.cosmetics.entity.QualityInspection;
import com.cosmetics.entity.WorkOrder;
import com.cosmetics.entity.WorkOrderMaterial;
import com.cosmetics.entity.WorkProcess;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public interface WorkOrderService {

    Page<WorkOrder> getPage(PageQuery pageQuery, Long productId, Integer status, Integer priority);

    WorkOrder getById(Long id);

    String generateOrderNo();

    void create(WorkOrderCreateDTO createDTO);

    void startProduction(Long id);

    void processNext(Long id, ProcessRecordDTO processDTO);

    void suspend(Long id, String reason);

    void resume(Long id);

    void cancel(Long id, String reason);

    void qualityCheck(Long id, QualityInspection inspection);

    void finishWarehousing(Long id, BigDecimal actualQuantity, Long operatorId);

    void autoSuspendOverdue();

    List<WorkOrderMaterial> getWorkOrderMaterials(Long workOrderId);

    void addWorkOrderMaterial(Long workOrderId, WorkOrderMaterialDTO materialDTO);

    void removeWorkOrderMaterial(Long id);

    List<WorkProcess> getWorkProcesses(Long workOrderId);

    Map<String, Object> getWorkOrderProgress(Long workOrderId);

    Map<String, Object> getStatistics();

    void pickMaterial(Long workOrderId, Long materialBatchId, BigDecimal quantity);

    void batchPickMaterial(Long workOrderId, List<Map<String, Object>> pickList);

    void confirmFormula(Long workOrderId);

    void unlockStock(Long workOrderId);
}
