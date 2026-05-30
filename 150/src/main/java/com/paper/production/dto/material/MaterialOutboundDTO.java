package com.paper.production.dto.material;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class MaterialOutboundDTO {

    @NotNull(message = "物料ID不能为空")
    private Long materialId;

    @NotBlank(message = "批次号不能为空")
    private String batchNo;

    @NotNull(message = "出库数量不能为空")
    private BigDecimal quantity;

    private String workOrderNo;
    private String receiver;
    private String remark;
}
