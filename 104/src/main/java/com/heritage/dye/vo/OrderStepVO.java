package com.heritage.dye.vo;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class OrderStepVO {
    private Long id;
    private Long orderId;
    private String orderNo;
    private Integer stepNo;
    private String stepName;
    private String description;
    private String operator;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Integer status;
    private String statusText;
    private String remark;
}
