package com.hardware.stamping.dto;

import com.hardware.stamping.common.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
public class ProductionOrderQueryDTO extends PageQuery {
    private String orderNo;
    private Long categoryId;
    private Integer status;
    private String operator;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
}
