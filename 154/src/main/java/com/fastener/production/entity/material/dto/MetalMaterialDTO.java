package com.fastener.production.entity.material.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class MetalMaterialDTO {

    private Long id;

    @NotBlank(message = "原料名称不能为空")
    private String materialName;

    @NotBlank(message = "原料编码不能为空")
    private String materialCode;

    @NotNull(message = "原料类型不能为空")
    private Integer materialType;

    private String specification;

    private String materialGrade;

    private String origin;

    private String supplier;

    private String unit;

    private BigDecimal unitPrice;

    private BigDecimal warningQuantity;

    private Integer rustProofCycle;

    @NotNull(message = "状态不能为空")
    private Integer status;

    private String remark;
}
