package com.construction.embedded.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("production_loss_record")
public class ProductionLossRecord {
    @TableId(type = IdType.AUTO)
    private Long id;

    private Long orderId;

    private String orderNo;

    private Long materialId;

    private String materialName;

    private String specification;

    private String lossType;

    private BigDecimal lossQuantity;

    private BigDecimal unitPrice;

    private BigDecimal totalLossCost;

    private Long operatorId;

    private String operatorName;

    private String remark;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
}
