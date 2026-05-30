package com.fitness.manufacture.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.fitness.manufacture.entity.WorkOrderMaterial;

import java.util.List;

public interface WorkOrderMaterialService extends IService<WorkOrderMaterial> {

    void allocateMaterials(Long workOrderId);

    List<WorkOrderMaterial> getMaterialsByWorkOrderId(Long workOrderId);

    void pickMaterial(Long id);

    void returnMaterial(Long id);
}
