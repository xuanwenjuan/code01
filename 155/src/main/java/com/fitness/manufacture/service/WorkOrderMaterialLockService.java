package com.fitness.manufacture.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.fitness.manufacture.entity.WorkOrderMaterialLock;

import java.math.BigDecimal;
import java.util.List;

public interface WorkOrderMaterialLockService extends IService<WorkOrderMaterialLock> {

    void lockMaterial(Long workOrderId, Long materialId, BigDecimal quantity);

    void releaseMaterialLock(Long workOrderId);

    List<WorkOrderMaterialLock> getLocksByWorkOrderId(Long workOrderId);

    void deductLockedMaterial(Long workOrderId);
}
