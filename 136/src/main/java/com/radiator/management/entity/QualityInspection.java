package com.radiator.management.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
@TableName("quality_inspection")
public class QualityInspection {
    @TableId(type = IdType.AUTO)
    private Long id;

    private String inspectionNo;

    private String inspectionType;

    private Long workOrderId;

    private String workOrderNo;

    private Long categoryId;

    private String categoryName;

    private Integer totalQuantity;

    private Integer sampleQuantity;

    private Integer qualifiedQuantity;

    private Integer unqualifiedQuantity;

    private String inspectionResult;

    private String remark;

    private Long inspectorId;

    private String inspectorName;

    private LocalDateTime inspectionTime;

    private String status;

    @TableField(exist = false)
    private List<QualityInspectionDetail> details;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    @TableLogic
    private Integer isDeleted;
}
