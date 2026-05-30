package com.cosmetics.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("quality_inspection")
public class QualityInspection {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long workOrderId;

    private Long inspectorId;

    private BigDecimal sampleQuantity;

    private BigDecimal qualifiedQuantity;

    private BigDecimal unqualifiedQuantity;

    private String inspectionItems;

    private Integer inspectionResult;

    private LocalDateTime inspectionTime;

    private String reportUrl;

    private String remark;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
}
