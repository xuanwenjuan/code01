package com.fitness.manufacture.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class WorkOrderQueryDTO {

    private String keyword;

    private String workOrderNo;

    private Long productId;

    private Long categoryId;

    private Integer status;

    private Long lineLeaderId;

    private Integer priority;

    private Integer isFrozen;

    private LocalDateTime planStartTimeStart;

    private LocalDateTime planStartTimeEnd;

    private LocalDateTime planEndTimeStart;

    private LocalDateTime planEndTimeEnd;

    private LocalDateTime actualStartTimeStart;

    private LocalDateTime actualStartTimeEnd;

    private LocalDateTime createTimeStart;

    private LocalDateTime createTimeEnd;

    private Integer minProgress;

    private Integer maxProgress;

    private Integer pageNum = 1;

    private Integer pageSize = 10;

    private String orderBy;

    private String orderDirection = "desc";
}
