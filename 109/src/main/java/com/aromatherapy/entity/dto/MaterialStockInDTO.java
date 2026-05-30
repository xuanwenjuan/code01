package com.aromatherapy.entity.dto;

import com.aromatherapy.validation.ValidPositiveNumber;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class MaterialStockInDTO {

    @NotBlank(message = "批次号不能为空")
    private String batchCode;

    @NotBlank(message = "原料名称不能为空")
    private String materialName;

    @NotBlank(message = "产地不能为空")
    private String origin;

    @NotBlank(message = "萃取工艺不能为空")
    private String extractionProcess;

    @ValidPositiveNumber(message = "纯度必须为正数")
    private BigDecimal purity;

    @NotNull(message = "保质期不能为空")
    private Integer shelfLife;

    @NotNull(message = "生产日期不能为空")
    private LocalDate productionDate;

    @NotNull(message = "入库数量不能为空")
    @ValidPositiveNumber(message = "入库数量必须为正数")
    private BigDecimal quantity;

    @NotBlank(message = "单位不能为空")
    private String unit;

    @NotNull(message = "单价不能为空")
    @ValidPositiveNumber(message = "单价必须为正数")
    private BigDecimal unitPrice;

    @NotNull(message = "预警数量不能为空")
    @ValidPositiveNumber(message = "预警数量必须为正数")
    private BigDecimal warningQuantity;

    private String remark;
}
