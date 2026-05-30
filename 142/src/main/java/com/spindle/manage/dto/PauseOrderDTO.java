package com.spindle.manage.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PauseOrderDTO {

    @NotNull(message = "工单ID不能为空")
    private Long orderId;

    @NotBlank(message = "暂停原因不能为空")
    private String reason;

}
