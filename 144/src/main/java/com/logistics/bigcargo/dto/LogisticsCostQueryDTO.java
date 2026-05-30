package com.logistics.bigcargo.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class LogisticsCostQueryDTO {
    private Integer pageNum = 1;
    private Integer pageSize = 10;

    private String orderNo;

    private Long categoryId;

    private List<Long> categoryIds;

    private String costMonth;

    private List<String> costMonths;

    private BigDecimal minTotalCost;

    private BigDecimal maxTotalCost;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    private String sortField = "createTime";

    private String sortOrder = "desc";
}
