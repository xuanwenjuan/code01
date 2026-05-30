package com.tarp.dto;

import com.tarp.entity.WorkOrder;
import com.tarp.entity.WorkOrderMaterial;
import lombok.Data;

import java.util.List;

@Data
public class WorkOrderDTO {
    private WorkOrder workOrder;
    private List<WorkOrderMaterial> materials;
}
