package com.logistics.bigcargo.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class DispatchOrderQueryDTO {
    private Integer pageNum = 1;
    private Integer pageSize = 10;

    private String orderNo;

    private Integer orderStatus;

    private List<Integer> orderStatuses;

    private Long categoryId;

    private Long driverId;

    private Long sorterId;

    private Long vehicleId;

    private String customerName;

    private String customerPhone;

    private String deliveryAddress;

    private BigDecimal minDistance;

    private BigDecimal maxDistance;

    private Integer priority;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    private LocalDateTime expectArriveStartTime;

    private LocalDateTime expectArriveEndTime;

    private String sortField = "createTime";

    private String sortOrder = "desc";
}
