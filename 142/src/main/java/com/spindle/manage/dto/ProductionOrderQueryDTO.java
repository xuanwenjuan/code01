package com.spindle.manage.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ProductionOrderQueryDTO {

    private String orderNo;

    private Long categoryId;

    private Integer orderStatus;

    private Integer currentProcess;

    private Integer materialPrepareStatus;

    private Long responsiblePerson;

    private LocalDateTime planStartTimeStart;

    private LocalDateTime planStartTimeEnd;

    private LocalDateTime createStartTime;

    private LocalDateTime createEndTime;

    private Integer current = 1;

    private Integer size = 10;

    private String orderBy = "createTime";

    private String orderType = "desc";

}
