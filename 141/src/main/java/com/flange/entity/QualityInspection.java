package com.flange.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("quality_inspection")
public class QualityInspection {
    @TableId(type = IdType.AUTO)
    private Long id;

    private String inspectionNo;

    private Long orderId;

    private String orderNo;

    private String inspectionType;

    private Integer inspectedQuantity;

    private Integer passedQuantity;

    private Integer defectQuantity;

    private BigDecimal defectRate;

    private String defectDescription;

    private String status;

    private Long inspectorId;

    private String inspectorName;

    private String approvalResult;

    private String approvalRemark;

    private Long approverId;

    private String approverName;

    private LocalDateTime approvalTime;

    private String remark;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    @TableLogic
    private Integer deleted;
}
