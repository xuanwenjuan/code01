package com.radiator.management.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("production_report")
public class ProductionReport {
    @TableId(type = IdType.AUTO)
    private Long id;

    private Long workOrderId;

    private String workOrderNo;

    private String processCode;

    private String processName;

    private Integer reportQuantity;

    private Integer qualifiedQuantity;

    private Integer defectiveQuantity;

    private BigDecimal laborHours;

    private BigDecimal laborCost;

    private BigDecimal equipmentHours;

    private BigDecimal equipmentCost;

    private String defectReason;

    private String remark;

    @TableField(fill = FieldFill.INSERT)
    private Long createBy;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    @TableLogic
    private Integer isDeleted;
}
