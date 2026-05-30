package com.gearbox.manage.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("quality_inspection")
public class QualityInspection extends BaseEntity {
    private String inspectionNo;
    private Long workOrderId;
    private Long processId;
    private Long inspectorId;
    private String inspectorName;
    private LocalDateTime inspectTime;
    private Integer inspectQuantity;
    private Integer qualifiedQuantity;
    private Integer scrapQuantity;
    private Integer reworkQuantity;
    private String scrapReason;
    private String inspectionItems;
    private String status;
    private String remark;
}
