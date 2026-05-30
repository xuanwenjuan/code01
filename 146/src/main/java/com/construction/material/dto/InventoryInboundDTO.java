package com.construction.material.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class InventoryInboundDTO {

    @NotBlank(message = "入库单号不能为空")
    private String inboundNo;

    @NotBlank(message = "供应商不能为空")
    private String supplier;

    @NotBlank(message = "仓库不能为空")
    private String warehouse;

    private LocalDateTime inboundDate;

    private String remark;

    @Valid
    @NotNull(message = "入库明细不能为空")
    private List<InventoryInboundDetailDTO> details;
}
