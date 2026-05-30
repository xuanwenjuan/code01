package com.valve.manufacture.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.valve.manufacture.common.BaseEntity;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("quality_inspection")
public class QualityInspection extends BaseEntity {

    private String inspectionNo;

    @NotNull(message = "工单ID不能为空")
    private Long workOrderId;

    private Long processId;

    private Long inspectorId;

    private String inspectionType;

    private Integer qualifiedQuantity;

    private Integer unqualifiedQuantity;

    private Integer scrapQuantity;

    private String inspectionResult;

    private LocalDateTime inspectionTime;

    private String remark;
}
