package com.construction.embedded.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class DefectHandleDTO {
    @NotNull(message = "工单ID不能为空")
    private Long orderId;

    @NotBlank(message = "处理类型不能为空")
    private String handleType;

    @NotNull(message = "次品数量不能为空")
    private Integer defectQuantity;

    private String remark;
}
