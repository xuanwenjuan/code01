package com.bee.equipment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class MaterialDTO {

    private Long id;

    @NotBlank(message = "物料名称不能为空")
    private String name;

    private Long categoryId;

    private String spec;

    private String origin;

    @NotBlank(message = "单位不能为空")
    private String unit;

    @NotNull(message = "库存数量不能为空")
    private BigDecimal quantity;

    private BigDecimal warnQuantity;

    private BigDecimal price;

    private Integer isMoistureSensitive = 0;

    private LocalDate expiryDate;

    private String status;
}
