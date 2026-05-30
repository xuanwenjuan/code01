package com.motor.core.dto;

import com.motor.core.validation.annotation.MaterialTypeValid;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class MaterialQueryDTO {
    private String materialName;

    @MaterialTypeValid
    private String materialType;

    private String specification;

    private Integer stockStatus;

    private BigDecimal minQuantity;

    private BigDecimal maxQuantity;

    private String supplier;

    private LocalDate startProductionDate;

    private LocalDate endProductionDate;

    private Integer pageNum = 1;

    private Integer pageSize = 10;
}
