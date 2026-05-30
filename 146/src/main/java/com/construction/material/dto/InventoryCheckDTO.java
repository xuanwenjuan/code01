package com.construction.material.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class InventoryCheckDTO {

    @NotBlank(message = "仓库不能为空")
    private String warehouse;

    private String remark;

    @Valid
    @NotNull(message = "盘点明细不能为空")
    private List<InventoryCheckDetailDTO> details;
}
