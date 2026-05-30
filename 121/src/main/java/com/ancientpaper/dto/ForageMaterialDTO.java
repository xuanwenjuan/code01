package com.ancientpaper.dto;

import com.ancientpaper.validation.CreateGroup;
import com.ancientpaper.validation.UpdateGroup;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class ForageMaterialDTO {

    @NotNull(message = "原料ID不能为空", groups = UpdateGroup.class)
    @Positive(message = "原料ID必须大于0", groups = UpdateGroup.class)
    private Long id;

    @NotBlank(message = "原料名称不能为空", groups = CreateGroup.class)
    @Size(max = 100, message = "原料名称长度不能超过100字符", groups = {CreateGroup.class, UpdateGroup.class})
    private String materialName;

    @Size(max = 200, message = "产地长度不能超过200字符", groups = {CreateGroup.class, UpdateGroup.class})
    private String originPlace;

    @PositiveOrZero(message = "纤维化程度不能为负")
    private BigDecimal fiberDegree;

    @NotNull(message = "库存数量不能为空", groups = CreateGroup.class)
    @PositiveOrZero(message = "库存数量不能为负")
    private BigDecimal quantity;

    @NotNull(message = "单价不能为空", groups = CreateGroup.class)
    @Positive(message = "单价必须大于0")
    private BigDecimal unitPrice;

    private Integer status = 1;

    private Integer moistureWarning = 0;

    private LocalDate harvestDate;

    @Size(max = 100, message = "存放位置长度不能超过100字符", groups = {CreateGroup.class, UpdateGroup.class})
    private String warehouseLocation;

    @Size(max = 500, message = "备注长度不能超过500字符", groups = {CreateGroup.class, UpdateGroup.class})
    private String remarks;
}
