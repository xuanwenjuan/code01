package com.battery.shell.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class MaterialQueryDTO {
    private String materialCode;

    private String materialName;

    private String materialType;

    private String status;

    private Integer isOxidizable;

    @DecimalMin(value = "0", message = "最小库存不能小于0")
    private BigDecimal minStock;

    @DecimalMin(value = "0", message = "最大库存不能小于0")
    private BigDecimal maxStock;

    private LocalDateTime startInboundTime;

    private LocalDateTime endInboundTime;

    @Positive(message = "页码必须大于0")
    private Integer pageNum = 1;

    @Positive(message = "每页条数必须大于0")
    private Integer pageSize = 10;
}
