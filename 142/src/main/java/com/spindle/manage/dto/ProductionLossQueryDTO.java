package com.spindle.manage.dto;

import lombok.Data;

@Data
public class ProductionLossQueryDTO {

    private Long orderId;

    private String orderNo;

    private Integer processCode;

    private String lossType;

    private String startDate;

    private String endDate;

    private Integer current = 1;

    private Integer size = 10;

}
