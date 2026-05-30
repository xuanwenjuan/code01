package com.spindle.manage.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class QualityCheckDTO {

    @NotNull(message = "工单ID不能为空")
    private Long orderId;

    @NotNull(message = "工序编码不能为空")
    private Integer processCode;

    @NotBlank(message = "质检结果不能为空")
    private String qualityResult;

    private String qualityRemark;

}
