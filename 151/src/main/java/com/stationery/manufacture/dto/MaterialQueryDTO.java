package com.stationery.manufacture.dto;

import jakarta.validation.constraints.Min;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class MaterialQueryDTO {

    @Min(value = 1, message = "页码最小为1")
    private Integer pageNum = 1;

    @Min(value = 1, message = "每页条数最小为1")
    private Integer pageSize = 10;

    private String materialCode;

    private String materialName;

    private String materialType;

    private String batchNo;

    private String supplier;

    private Integer stockStatus;

    private Integer purchaseStatus;

    private Integer moistureProof;

    private BigDecimal minQuantity;

    private BigDecimal maxQuantity;

    private BigDecimal minUnitPrice;

    private BigDecimal maxUnitPrice;

    private String storageLocation;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    private String sortField;

    private String sortOrder;
}
