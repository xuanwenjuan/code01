package com.battery.shell.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class MaterialDTO {
    private Long id;

    @NotBlank(message = "物料编码不能为空")
    private String materialCode;

    @NotBlank(message = "物料名称不能为空")
    private String materialName;

    @NotBlank(message = "物料类型不能为空")
    private String materialType;

    private String spec;

    private String unit = "KG";

    @NotNull(message = "库存数量不能为空")
    private BigDecimal stockQuantity;

    @NotNull(message = "告警数量不能为空")
    private BigDecimal warningQuantity;

    private String status = "ENOUGH";

    private Integer isOxidizable = 0;

    private Integer storageDays = 30;
}
