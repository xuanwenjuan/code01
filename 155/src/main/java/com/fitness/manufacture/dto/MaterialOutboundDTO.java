package com.fitness.manufacture.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class MaterialOutboundDTO {

    private Long id;

    private Long workOrderId;

    @NotNull(message = "物料ID不能为空")
    private Long materialId;

    private String materialName;

    private String batchNo;

    @NotNull(message = "出库数量不能为空")
    private BigDecimal quantity;

    @NotBlank(message = "出库类型不能为空")
    private String outboundType;

    private String receiver;

    private String remark;
}
