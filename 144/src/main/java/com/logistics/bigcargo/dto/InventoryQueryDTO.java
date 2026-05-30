package com.logistics.bigcargo.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class InventoryQueryDTO {
    private Integer pageNum = 1;
    private Integer pageSize = 10;

    private Long categoryId;

    private List<Long> categoryIds;

    private Integer stockStatus;

    private List<Integer> stockStatuses;

    private String goodsName;

    private String batchNo;

    private String storageZone;

    private Integer bearingLevel;

    private Integer fragileFlag;

    private BigDecimal minWeight;

    private BigDecimal maxWeight;

    private BigDecimal minVolume;

    private BigDecimal maxVolume;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    private String sortField = "createTime";

    private String sortOrder = "desc";
}
