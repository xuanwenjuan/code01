package com.flange.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class MaterialQueryDto {
    private String materialCode;
    private String materialName;
    private String materialType;
    private String batchNo;
    private String specification;
    private String status;
    private Integer isRustProne;
    private String supplier;
    private BigDecimal minQuantity;
    private BigDecimal maxQuantity;
    private LocalDate inTimeStart;
    private LocalDate inTimeEnd;
    private Boolean needWarning;
    private String sortField;
    private String sortOrder;
}
