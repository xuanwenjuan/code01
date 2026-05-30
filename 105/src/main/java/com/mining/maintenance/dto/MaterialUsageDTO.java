package com.mining.maintenance.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class MaterialUsageDTO {

    private Long orderId;

    private String orderNo;

    @NotNull(message = "物资ID不能为空")
    private Long materialId;

    @NotNull(message = "领用数量不能为空")
    private Integer quantity;

    @NotBlank(message = "所属矿区不能为空")
    private String miningArea;

    private Long equipmentId;

    private String equipmentCode;

    @NotNull(message = "领用人ID不能为空")
    private Long receiverId;

    @NotBlank(message = "领用人姓名不能为空")
    private String receiverName;

    private String usagePurpose;

    private String remarks;
}