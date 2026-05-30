package com.instrument.consignment.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class MaterialLockDTO {

    @NotNull(message = "材料ID不能为空")
    private Long materialId;

    @NotNull(message = "数量不能为空")
    private Integer quantity;
}
