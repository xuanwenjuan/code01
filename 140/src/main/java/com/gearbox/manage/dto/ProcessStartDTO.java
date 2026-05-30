package com.gearbox.manage.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ProcessStartDTO {
    @NotNull(message = "工序ID不能为空")
    private Long processId;

    private String machineCode;

    private String remark;
}
