package com.construction.material.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class InventoryTransferDTO {

    @NotBlank(message = "调出仓库不能为空")
    private String fromWarehouse;

    @NotBlank(message = "调入仓库不能为空")
    private String toWarehouse;

    private String remark;

    @Valid
    @NotNull(message = "调拨明细不能为空")
    private List<InventoryTransferDetailDTO> details;
}
