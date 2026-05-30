package com.snacktrace.service;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.snacktrace.entity.WorkOrderMaterial;
import com.snacktrace.mapper.WorkOrderMaterialMapper;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
public class WorkOrderMaterialService extends ServiceImpl<WorkOrderMaterialMapper, WorkOrderMaterial> {

    public BigDecimal getTotalMaterialCost(Long workOrderId) {
        return baseMapper.sumTotalCostByWorkOrderId(workOrderId);
    }
}
