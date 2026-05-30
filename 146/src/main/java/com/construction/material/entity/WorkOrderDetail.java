package com.construction.material.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("work_order_detail")
public class WorkOrderDetail {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long workOrderId;

    private Long inventoryId;

    private Long categoryId;

    private String categoryName;

    private String materialName;

    private String specification;

    private String unit;

    private BigDecimal planQuantity;

    private BigDecimal actualQuantity;

    private BigDecimal unitPrice;

    private BigDecimal totalAmount;

    private BigDecimal usedQuantity;

    private BigDecimal returnedQuantity;

    private BigDecimal lostQuantity;

    private String batchNo;

    private String remark;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    @TableField(fill = FieldFill.INSERT)
    private Long createBy;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private Long updateBy;

    @TableLogic
    private Integer deleted;
}
