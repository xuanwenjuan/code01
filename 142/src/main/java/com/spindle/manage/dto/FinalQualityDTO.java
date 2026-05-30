package com.spindle.manage.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class FinalQualityDTO {

    @NotNull(message = "工单ID不能为空")
    private Long orderId;

    @NotBlank(message = "质检结果不能为空")
    private String result;

    private String remark;

}
