package com.fan.impeller.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("work_order")
public class WorkOrder extends BaseEntity {
    private String orderNo;
    private Long productId;
    private String productName;
    private BigDecimal quantity;
    private Integer status;
    private Integer currentStep;
    private LocalDateTime planStartTime;
    private LocalDateTime actualStartTime;
    private LocalDateTime planEndTime;
    private LocalDateTime actualEndTime;
    private String meltingRecords;
    private String castingRecords;
    private String coolingRecords;
    private String trimmingRecords;
    private String balancingRecords;
    private String surfaceTreatmentRecords;
    private String storageRecords;
    private Long operatorId;
    private String operatorName;
    private String remark;
}
