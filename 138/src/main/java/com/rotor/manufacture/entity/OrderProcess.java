package com.rotor.manufacture.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("order_process")
public class OrderProcess extends BaseEntity {
    private Long orderId;
    private String orderNo;
    private Integer processType;
    private String processName;
    private Integer sort;
    private Integer status;
    private Long operatorId;
    private String operatorName;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Integer qualifiedQuantity;
    private Integer defectiveQuantity;
    private BigDecimal energyConsumption;
    private BigDecimal laborHours;
    private BigDecimal equipmentCost;
    private BigDecimal scrapMaterialCost;
    private String remark;
}