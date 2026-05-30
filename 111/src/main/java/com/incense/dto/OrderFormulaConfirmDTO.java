package com.incense.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class OrderFormulaConfirmDTO {

    @NotNull(message = "工单ID不能为空")
    private Long orderId;

    private String formulaDetail;

    @NotEmpty(message = "原料配比列表不能为空")
    @Valid
    private List<MaterialUsageDTO> materialList;
}
