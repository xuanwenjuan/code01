package com.snack.processing.dto.workorder;

import lombok.Data;

@Data
public class ProcessStartDTO {

    private Long workOrderId;
    private String processCode;
    private String operatorName;
    private String equipment;
}
