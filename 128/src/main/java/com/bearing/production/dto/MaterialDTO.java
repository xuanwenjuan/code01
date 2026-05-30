package com.bearing.production.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class MaterialDTO {

    @NotBlank(message = "原料名称不能为空")
    @Size(max = 200, message = "原料名称长度不能超过200")
    private String materialName;

    @Size(max = 500, message = "规格说明长度不能超过500")
    private String specification;

    @NotBlank(message = "原料类型不能为空")
    @Size(max = 100, message = "原料类型长度不能超过100")
    private String materialType;

    @Size(max = 200, message = "供应商名称长度不能超过200")
    private String supplier;

    @DecimalMin(value = "0", message = "单价不能为负数")
    private BigDecimal unitPrice;

    @NotNull(message = "库存数量不能为空")
    @DecimalMin(value = "0", message = "库存数量不能为负数")
    private BigDecimal stockQuantity;

    @NotBlank(message = "单位不能为空")
    @Size(max = 20, message = "单位长度不能超过20")
    private String unit;

    @DecimalMin(value = "0", message = "预警数量不能为负数")
    private BigDecimal warningQuantity;

    private Integer rustProof;

    private Integer rustProofDays;

    private String remark;
}
