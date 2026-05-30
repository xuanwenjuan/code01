package com.mushroom.traceability.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class HarvestTaskQueryDTO {
    private String taskName;
    private Long areaId;
    private Long harvesterId;
    private String taskStatus;
    private LocalDateTime expireTimeStart;
    private LocalDateTime expireTimeEnd;
    private LocalDateTime createTimeStart;
    private LocalDateTime createTimeEnd;
    private Integer pageNum = 1;
    private Integer pageSize = 10;
}