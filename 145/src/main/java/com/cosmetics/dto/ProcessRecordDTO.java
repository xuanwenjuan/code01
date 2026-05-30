package com.cosmetics.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class ProcessRecordDTO {

    private Long workOrderId;

    private Integer processStep;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    private String operator;

    private String equipment;

    private BigDecimal temperature;

    private BigDecimal stirringSpeed;

    private String processParams;

    private String qualityCheck;

    private String remark;
}
