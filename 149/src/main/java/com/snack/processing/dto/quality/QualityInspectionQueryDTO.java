package com.snack.processing.dto.quality;

import com.snack.processing.common.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
public class QualityInspectionQueryDTO extends PageQuery {
    private String inspectionNo;
    private Long workOrderId;
    private String workOrderNo;
    private Integer inspectionType;
    private Integer inspectionResult;
    private LocalDateTime inspectionTimeStart;
    private LocalDateTime inspectionTimeEnd;
}
