package com.construction.material.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class WorkOrderQueryDTO {

    private Integer status;

    private Integer orderType;

    private String projectName;

    private String constructionTeam;

    private String auditor;

    private String warehouseKeeper;

    private LocalDateTime startDate;

    private LocalDateTime endDate;
}
