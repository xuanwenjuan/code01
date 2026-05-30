package com.fan.impeller.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("quality_inspection")
public class QualityInspection extends BaseEntity {
    private Long workOrderId;
    private String workOrderNo;
    private Integer step;
    private String stepName;
    private BigDecimal totalQuantity;
    private BigDecimal qualifiedQuantity;
    private BigDecimal unqualifiedQuantity;
    private String unqualifiedReason;
    private BigDecimal scrapQuantity;
    private BigDecimal reworkQuantity;
    private Long inspectorId;
    private String inspectorName;
    private LocalDateTime inspectionTime;
    private Integer result;
    private String remark;
}
