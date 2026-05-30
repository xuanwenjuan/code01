package com.plastic.injection.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class MaterialStockDTO {

    private Long id;

    @NotBlank(message = "原料名称不能为空")
    @Size(max = 100, message = "原料名称长度不能超过100")
    private String materialName;

    @NotBlank(message = "原料牌号不能为空")
    @Size(max = 50, message = "原料牌号长度不能超过50")
    private String materialCode;

    @Size(max = 100, message = "品牌长度不能超过100")
    private String brand;

    @Size(max = 30, message = "颜色长度不能超过30")
    private String color;

    @DecimalMin(value = "0", message = "熔融指数不能为负数")
    private BigDecimal meltIndex;

    @NotNull(message = "是否易潮不能为空")
    private Integer isHygroscopic;

    @NotBlank(message = "批次号不能为空")
    @Size(max = 50, message = "批次号长度不能超过50")
    private String batchNo;

    @NotNull(message = "库存数量不能为空")
    @DecimalMin(value = "0", message = "库存数量不能为负数")
    private BigDecimal quantity;

    private String unit;

    @DecimalMin(value = "0", message = "预警数量不能为负数")
    private BigDecimal warningQuantity;

    private Integer stockStatus;

    @DecimalMin(value = "0", message = "单价不能为负数")
    private BigDecimal unitPrice;

    private LocalDate productionDate;

    @Min(value = 0, message = "保质期不能为负数")
    private Integer shelfLife;

    private LocalDate expireDate;

    private String warehouseLocation;

    private String remark;
}
