package com.evparts.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class MaterialDTO {

    private Long id;

    @NotBlank(message = "原料名称不能为空")
    private String materialName;

    @NotBlank(message = "原料编码不能为空")
    private String materialCode;

    @NotBlank(message = "原料类型不能为空")
    private String materialType;

    private String specification;

    private String unit;

    private Integer moistureProof = 0;

    @NotNull(message = "预警库存不能为空")
    private BigDecimal warningStock;

    private Integer status = 1;

    private String remark;

}
