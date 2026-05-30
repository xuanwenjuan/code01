package com.amber.customize.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class AmberRawDTO {

    private Long id;

    @NotBlank(message = "产地不能为空")
    private String origin;

    @NotNull(message = "原石克重不能为空")
    private BigDecimal weight;

    private String clarity;

    private String inclusions;

    private Integer status;

    private LocalDate storageDate;

    private String remark;

}
