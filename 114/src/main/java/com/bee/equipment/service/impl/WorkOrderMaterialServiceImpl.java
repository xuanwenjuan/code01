package com.bee.equipment.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.bee.equipment.entity.WorkOrderMaterial;
import com.bee.equipment.mapper.WorkOrderMaterialMapper;
import com.bee.equipment.service.WorkOrderMaterialService;
import org.springframework.stereotype.Service;

@Service
public class WorkOrderMaterialServiceImpl extends ServiceImpl<WorkOrderMaterialMapper, WorkOrderMaterial> implements WorkOrderMaterialService {
}
