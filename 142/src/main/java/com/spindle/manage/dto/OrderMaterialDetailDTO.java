package com.spindle.manage.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class OrderMaterialDetailDTO {

    @NotNull(message = "工单ID不能为空")
    private Long orderId;

    @NotNull(message = "物料ID不能为空")
    private Long materialId;

    @NotBlank(message = "物料名称不能为空")
    private String materialName;

    @NotBlank(message = "物料类型不能为空")
    private String materialType;

    private String batchNo;

    @NotNull(message = "领用数量不能为空")
    private BigDecimal quantity;

    private String unit;

    private BigDecimal unitPrice;

    private String remark;

}
