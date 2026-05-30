package com.valve.manufacture.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class ProcessConfirmDTO {

    @NotNull(message = "工单ID不能为空")
    private Long workOrderId;

    @NotEmpty(message = "工序列表不能为空")
    @Valid
    private List<ProcessDetailDTO> processes;

    private String remark;
}
