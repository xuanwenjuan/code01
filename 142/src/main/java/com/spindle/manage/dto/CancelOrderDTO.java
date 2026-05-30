package com.spindle.manage.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CancelOrderDTO {

    @NotNull(message = "工单ID不能为空")
    private Long orderId;

    @NotBlank(message = "取消原因不能为空")
    private String reason;

}
