package com.gearbox.manage.service;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.gearbox.manage.entity.WorkOrderMaterial;
import com.gearbox.manage.mapper.WorkOrderMaterialMapper;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class WorkOrderMaterialService extends ServiceImpl<WorkOrderMaterialMapper, WorkOrderMaterial> {

    public List<WorkOrderMaterial> listByWorkOrderId(Long workOrderId) {
        return lambdaQuery()
                .eq(WorkOrderMaterial::getWorkOrderId, workOrderId)
                .list();
    }
}
