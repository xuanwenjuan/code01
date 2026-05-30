package com.zongshi.brush.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class CraftConfirmDTO {
    @NotNull(message = "工单ID不能为空")
    private Long orderId;

    @NotBlank(message = "工艺类型不能为空")
    private String craftType;

    private String remark;

    @NotNull(message = "原料清单不能为空")
    private List<OrderMaterialDTO> materials;
}
