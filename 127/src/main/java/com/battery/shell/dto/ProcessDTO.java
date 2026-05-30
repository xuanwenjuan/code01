package com.battery.shell.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

@Data
public class ProcessDTO {
    @NotNull(message = "工单ID不能为空")
    private Long orderId;

    @NotBlank(message = "工序步骤不能为空")
    private String processStep;

    @NotNull(message = "数量不能为空")
    @PositiveOrZero(message = "数量必须大于等于0")
    private Integer quantity;

    private Integer defectiveQuantity;

    private String remark;
}
