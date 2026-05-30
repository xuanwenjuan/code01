package com.horncomb.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class HornMaterialDTO {
    private Long id;

    @NotBlank(message = "批次编号不能为空")
    @Size(max = 50, message = "批次编号长度不能超过50")
    private String batchNo;

    @NotBlank(message = "牛角类型不能为空")
    @Size(max = 50, message = "牛角类型长度不能超过50")
    private String hornType;

    @Size(max = 100, message = "产地长度不能超过100")
    private String origin;

    @NotNull(message = "厚度不能为空")
    @DecimalMin(value = "0", message = "厚度不能小于0")
    private BigDecimal thickness;

    @Size(max = 20, message = "品级长度不能超过20")
    private String grade;

    @NotNull(message = "重量不能为空")
    @DecimalMin(value = "0", message = "重量不能小于0")
    private BigDecimal weight;

    @NotNull(message = "数量不能为空")
    @Min(value = 0, message = "数量不能小于0")
    private Integer quantity;

    @NotNull(message = "单价不能为空")
    @DecimalMin(value = "0", message = "单价不能小于0")
    private BigDecimal unitPrice;

    @Min(value = 0, message = "预警数量不能小于0")
    private Integer warningQuantity;

    private LocalDate expireRemindDate;

    private LocalDate purchaseDate;

    @Size(max = 500, message = "备注长度不能超过500")
    private String remark;
}
