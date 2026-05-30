package com.incense.vo;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class OrderProcessLogVO {
    private Long id;
    private Long orderId;
    private String orderNo;
    private String processStep;
    private Long operatorId;
    private String operatorName;
    private LocalDateTime operationTime;
    private String remark;
}
