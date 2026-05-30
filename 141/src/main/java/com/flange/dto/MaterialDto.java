package com.flange.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class MaterialDto {
    private Long id;

    @NotBlank(message = "物料编码不能为空")
    @Size(max = 50, message = "物料编码长度不能超过50")
    private String materialCode;

    @NotBlank(message = "物料名称不能为空")
    @Size(max = 100, message = "物料名称长度不能超过100")
    private String materialName;

    @NotBlank(message = "物料类型不能为空")
    @Size(max = 50, message = "物料类型长度不能超过50")
    private String materialType;

    @Size(max = 200, message = "规格型号长度不能超过200")
    private String specification;

    @Size(max = 20, message = "单位长度不能超过20")
    private String unit = "kg";

    @NotNull(message = "库存数量不能为空")
    @DecimalMin(value = "0", message = "库存数量不能为负数")
    @DecimalMax(value = "999999.99", message = "库存数量超出范围")
    private BigDecimal quantity;

    private BigDecimal unitPrice;

    @DecimalMin(value = "0", message = "预警数量不能为负数")
    private BigDecimal warningQuantity = BigDecimal.ZERO;

    private String status = "SUFFICIENT";

    private Integer isRustProne = 0;

    private LocalDate rustRemindDate;

    @Size(max = 100, message = "存放位置长度不能超过100")
    private String location;

    @Size(max = 100, message = "供应商长度不能超过100")
    private String supplier;
}
