package com.motor.core.entity.po;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("production_order")
public class ProductionOrderPO {
    @TableId(type = IdType.AUTO)
    private Long id;

    private String orderNo;

    private Long categoryId;

    private String productName;

    private Integer planQuantity;

    private Integer actualQuantity;

    private Long materialId;

    private BigDecimal materialUsage;

    private Integer status;

    private Integer priority;

    private LocalDate planStartDate;

    private LocalDate planEndDate;

    private LocalDateTime actualStartTime;

    private LocalDateTime actualEndTime;

    private Long processLeaderId;

    private BigDecimal materialWaste;

    private BigDecimal energyConsumption;

    private BigDecimal laborHours;

    private Integer defectiveQuantity;

    private BigDecimal totalCost;

    private String remark;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    @TableLogic
    private Integer deleted;
}
