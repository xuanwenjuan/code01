package com.radiator.management.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("production_loss")
public class ProductionLoss {
    @TableId(type = IdType.AUTO)
    private Long id;

    private Long workOrderId;

    private String workOrderNo;

    private Long materialId;

    private String materialCode;

    private String materialName;

    private String lossType;

    private BigDecimal lossQuantity;

    private BigDecimal unitPrice;

    private BigDecimal totalAmount;

    private String lossReason;

    private String responsiblePerson;

    private Integer isCharged;

    private String remark;

    private Long reportUserId;

    private String reportUserName;

    private LocalDateTime reportTime;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    @TableLogic
    private Integer isDeleted;
}
