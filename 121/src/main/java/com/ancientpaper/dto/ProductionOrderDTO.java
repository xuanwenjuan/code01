package com.ancientpaper.dto;

import com.ancientpaper.validation.CreateGroup;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class ProductionOrderDTO {

    @NotNull(message = "纸品分类不能为空", groups = CreateGroup.class)
    @Positive(message = "纸品分类ID必须大于0", groups = CreateGroup.class)
    private Long categoryId;

    @NotNull(message = "目标产量不能为空", groups = CreateGroup.class)
    @Positive(message = "目标产量必须大于0", groups = CreateGroup.class)
    private BigDecimal targetQuantity;

    private Long craftsmanId;

    @Size(max = 500, message = "备注长度不能超过500字符")
    private String remarks;

    @Valid
    private List<OrderMaterialDTO> materials;
}
