package com.flange.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("production_order")
public class ProductionOrder {
    @TableId(type = IdType.AUTO)
    private Long id;

    private String orderNo;

    private Long flangeCategoryId;

    private String flangeCategoryName;

    private Long materialId;

    private String materialName;

    private java.math.BigDecimal requiredMaterial;

    private java.math.BigDecimal unitPrice;

    private Integer quantity;

    private Integer actualQuantity;

    private Integer rejectionQuantity;

    private Integer priority;

    private String status;

    private String processStatus;

    private LocalDate planStartDate;

    private LocalDate planEndDate;

    private LocalDateTime actualStartDate;

    private LocalDateTime actualEndDate;

    private Integer isOverdue;

    private String remark;

    private Long createBy;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    @TableLogic
    private Integer deleted;
}
