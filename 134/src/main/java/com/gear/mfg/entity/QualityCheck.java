package com.gear.mfg.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("quality_check")
public class QualityCheck extends BaseEntity {

    private String checkNo;

    private Integer checkType;

    private Long orderId;

    private String orderNo;

    private Long processId;

    private Integer processNo;

    private String processName;

    private Long productId;

    private String productCode;

    private String productName;

    private String productSpec;

    private BigDecimal checkQuantity;

    private BigDecimal goodQuantity;

    private BigDecimal badQuantity;

    private BigDecimal repairQuantity;

    private BigDecimal scrapQuantity;

    private String badDescription;

    private String checkStandard;

    private String checkResult;

    private Integer status;

    private String checker;

    private LocalDateTime checkTime;

    private String auditor;

    private LocalDateTime auditTime;

    private String remark;
}
