package com.snack.processing.dto.material;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class MaterialAddDTO {

    @NotBlank(message = "材料名称不能为空")
    private String name;

    @NotBlank(message = "材料编码不能为空")
    private String code;

    private Long categoryId;

    private String categoryName;

    private String unit;

    private String spec;

    private BigDecimal warningStock;

    private BigDecimal maxStock;

    private Integer isFresh = 0;

    private Integer shelfLifeDays;

    private String supplier;

    private Integer status = 1;

    private String description;
}
