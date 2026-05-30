package com.valve.manufacture.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class MaterialQueryDTO {

    private String materialCode;

    private String materialName;

    private String materialType;

    private String material;

    private String specification;

    private Integer status;

    private Integer isRustProne;

    @DecimalMin(value = "0", message = "最小库存不能小于0")
    private BigDecimal minQuantity;

    @DecimalMin(value = "0", message = "最大库存不能小于0")
    private BigDecimal maxQuantity;

    private LocalDate startDate;

    private LocalDate endDate;

    private String keyword;

    @Pattern(regexp = "createTime|updateTime|totalQuantity|materialCode", message = "排序字段不正确")
    private String sortField;

    @Pattern(regexp = "asc|desc", message = "排序方式不正确")
    private String sortOrder;
}
