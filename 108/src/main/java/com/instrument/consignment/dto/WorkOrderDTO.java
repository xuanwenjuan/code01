package com.instrument.consignment.dto;

import com.instrument.consignment.enums.WorkOrderStatusEnum;
import com.instrument.consignment.validation.EnumValue;
import com.instrument.consignment.validation.Phone;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class WorkOrderDTO {

    private Long id;

    private String workOrderNo;

    @NotNull(message = "乐器档案ID不能为空")
    private Long archiveId;

    private String traceNo;

    private String customerName;

    @Phone
    private String customerPhone;

    @NotBlank(message = "收品方式不能为空")
    private String receiveType;

    private String receiveAddress;

    private LocalDateTime receiveTime;

    private Long receiveUserId;

    private Long estimatorId;

    private LocalDateTime estimateTime;

    private String estimateRemark;

    private Long craftsmanId;

    @EnumValue(enumClass = WorkOrderStatusEnum.class, message = "无效的工单状态")
    private String status;

    private BigDecimal actualMaterialCost;

    private BigDecimal actualLaborCost;

    private BigDecimal totalRefurbishCost;

    private String remark;

    private List<WorkOrderStepDTO> steps;
}
