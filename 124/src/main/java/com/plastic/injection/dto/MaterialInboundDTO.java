package com.plastic.injection.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
public class MaterialInboundDTO {

    @NotBlank(message = "入库单号不能为空")
    private String inboundNo;

    @Valid
    @NotEmpty(message = "入库明细不能为空")
    private List<MaterialItemDTO> items;

    @Size(max = 500, message = "备注长度不能超过500")
    private String remark;
}

@Data
class MaterialItemDTO {

    @NotBlank(message = "原料名称不能为空")
    private String materialName;

    @NotBlank(message = "原料牌号不能为空")
    private String materialCode;

    private String brand;

    private String color;

    private BigDecimal meltIndex;

    private Integer isHygroscopic;

    @NotBlank(message = "批次号不能为空")
    private String batchNo;

    @NotNull(message = "入库数量不能为空")
    @DecimalMin(value = "0.01", message = "入库数量必须大于0")
    private BigDecimal quantity;

    private String unit;

    private BigDecimal warningQuantity;

    private BigDecimal unitPrice;

    private LocalDate productionDate;

    private Integer shelfLife;

    private String warehouseLocation;
}
