package com.zongshi.brush.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.hibernate.validator.constraints.Length;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class MaterialArchiveDTO {
    private Long id;

    @NotBlank(message = "原料编号不能为空")
    @Length(max = 50, message = "原料编号长度不能超过50")
    private String materialCode;

    @NotBlank(message = "原料名称不能为空")
    @Length(max = 100, message = "原料名称长度不能超过100")
    private String materialName;

    @NotNull(message = "原料类型不能为空")
    private Integer materialType;

    private String originPlace;

    private String grade;

    private Long categoryId;

    @NotBlank(message = "计量单位不能为空")
    private String unit;

    @NotNull(message = "单价不能为空")
    private BigDecimal unitPrice;

    private BigDecimal stockQuantity;

    private BigDecimal warningQuantity;

    private Integer isMoistureSensitive;

    private LocalDate moistureExpireDate;

    private LocalDate purchaseDate;

    private String supplier;

    private String remark;

    private Integer status;
}
