package com.construction.material.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class MaterialInventoryQueryDTO {

    private Long categoryId;

    private List<Long> categoryIds;

    private String materialName;

    private String materialCode;

    private String specification;

    private List<String> specifications;

    private String batchNo;

    private String supplier;

    private String warehouse;

    private List<String> warehouses;

    private Integer inventoryStatus;

    private List<Integer> inventoryStatuses;

    private BigDecimal minQuantity;

    private BigDecimal maxQuantity;

    private BigDecimal minUnitPrice;

    private BigDecimal maxUnitPrice;

    private BigDecimal minTotalAmount;

    private BigDecimal maxTotalAmount;

    private LocalDateTime startCreateTime;

    private LocalDateTime endCreateTime;

    private LocalDateTime startProductionDate;

    private LocalDateTime endProductionDate;

    private LocalDateTime startExpiryDate;

    private LocalDateTime endExpiryDate;

    private String sortField;

    private String sortOrder;
}
