package com.construction.material.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class InventoryFlowQueryDTO {

    private Long inventoryId;

    private String materialName;

    private Integer flowType;

    private String warehouse;

    private LocalDateTime startDate;

    private LocalDateTime endDate;
}
