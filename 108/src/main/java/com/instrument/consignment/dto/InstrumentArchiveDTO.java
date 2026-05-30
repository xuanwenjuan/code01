package com.instrument.consignment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class InstrumentArchiveDTO {

    private Long id;

    private String traceNo;

    @NotNull(message = "类目ID不能为空")
    private Long categoryId;

    @NotBlank(message = "品牌不能为空")
    private String brand;

    private Integer productionYear;

    private String model;

    @NotBlank(message = "成色等级不能为空")
    private String conditionLevel;

    private Integer accessoriesComplete;

    private String accessoriesDesc;

    private String appearanceDesc;

    private String status;

    private Long sellerId;

    private BigDecimal estimatedPrice;

    private BigDecimal salePrice;

    private Integer maintainCycleDays;

    private String remark;
}
