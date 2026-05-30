package com.spindle.manage.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ReleaseInventoryDTO {

    @NotNull(message = "工单ID不能为空")
    private Long orderId;

    private Long materialId;

}
