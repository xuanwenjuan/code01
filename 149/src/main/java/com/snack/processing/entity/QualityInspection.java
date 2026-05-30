package com.snack.processing.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("quality_inspection")
public class QualityInspection extends BaseEntity {

    private String inspectionNo;
    private Long workOrderId;
    private String workOrderNo;
    private String processCode;
    private String processName;
    private Integer inspectionType;
    private Integer inspectionResult;
    private BigDecimal sampleQuantity;
    private BigDecimal qualifiedQuantity;
    private BigDecimal unqualifiedQuantity;
    private String unqualifiedReason;
    private Long inspectorId;
    private String inspectorName;
    private LocalDateTime inspectionTime;
    private String remark;
}
