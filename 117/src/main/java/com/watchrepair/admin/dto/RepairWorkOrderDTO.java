package com.watchrepair.admin.dto;

import com.watchrepair.admin.entity.WorkOrderPart;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class RepairWorkOrderDTO {

    private Long id;

    @NotNull(message = "钟表类目不能为空")
    private Long categoryId;

    @NotBlank(message = "钟表型号不能为空")
    private String watchModel;

    @NotBlank(message = "客户姓名不能为空")
    private String customerName;

    @NotBlank(message = "客户电话不能为空")
    private String customerPhone;

    private String faultDescription;

    private Long technicianId;

    private Long partsSelectorId;

    private BigDecimal laborCost;

    private BigDecimal appearanceCost;

    private String inspectionReport;

    private String remarks;

    private List<WorkOrderPart> workOrderParts;
}