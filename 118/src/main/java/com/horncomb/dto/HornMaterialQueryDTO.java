package com.horncomb.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class HornMaterialQueryDTO {
    @Size(max = 50, message = "批次编号长度不能超过50")
    private String batchNo;

    @Size(max = 50, message = "牛角类型长度不能超过50")
    private String hornType;

    @Size(max = 20, message = "品级长度不能超过20")
    private String grade;

    private String stockStatus;

    @Size(max = 100, message = "产地长度不能超过100")
    private String origin;

    @DecimalMin(value = "0", message = "最小厚度不能小于0")
    private BigDecimal minThickness;

    @DecimalMin(value = "0", message = "最大厚度不能小于0")
    private BigDecimal maxThickness;

    @Min(value = 0, message = "最小数量不能小于0")
    private Integer minQuantity;

    @Min(value = 0, message = "最大数量不能小于0")
    private Integer maxQuantity;

    private LocalDate purchaseStartDate;

    private LocalDate purchaseEndDate;

    private LocalDate expireStartDate;

    private LocalDate expireEndDate;
}
