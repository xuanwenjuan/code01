package com.fan.impeller.dto;

import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class PurchaseOrderQueryDTO {
    @Size(max = 100, message = "采购单号长度不能超过100")
    private String orderNo;

    @Size(max = 100, message = "原料名称长度不能超过100")
    private String materialName;

    @Size(max = 50, message = "原料类型长度不能超过50")
    private String materialType;

    private Integer status;

    private Long applicantId;

    private LocalDateTime startTime;

    private LocalDateTime endTime;
}
