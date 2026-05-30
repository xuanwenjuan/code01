package com.motor.core.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("production_order")
public class ProductionOrder extends BaseEntity {
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
    private String remark;
}
