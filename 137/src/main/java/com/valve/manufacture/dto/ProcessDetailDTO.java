package com.valve.manufacture.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class ProcessDetailDTO {

    @NotBlank(message = "工序名称不能为空")
    private String processName;

    @NotBlank(message = "工序编码不能为空")
    private String processCode;

    @NotNull(message = "工序顺序不能为空")
    private Integer processOrder;

    @Positive(message = "标准工时必须大于0")
    private BigDecimal standardHours;

    @Valid
    private List<ProcessMaterialDTO> materials;

    private String remark;
}
