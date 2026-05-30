package com.fastener.production.entity.workorder;

import com.baomidou.mybatisplus.annotation.TableName;
import com.fastener.production.common.entity.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("cold_heading_work_order")
public class ColdHeadingWorkOrder extends BaseEntity {

    private String orderNo;

    private Long categoryId;

    private String categoryName;

    private String specification;

    private Integer planQuantity;

    private Integer actualQuantity;

    private Integer scrapQuantity;

    private Long materialId;

    private String materialName;

    private BigDecimal materialUsage;

    private BigDecimal materialReservedQuantity;

    private LocalDateTime materialReservedTime;

    private String workCenter;

    private String machineCode;

    private String operator;

    private LocalDate planStartDate;

    private LocalDate planEndDate;

    private LocalDateTime actualStartTime;

    private LocalDateTime actualEndTime;

    private Integer status;

    private Integer auditStatus;

    private String auditor;

    private LocalDateTime auditTime;

    private String auditRemark;

    private Integer priority;

    private String processRemark;

    private String qualityStandard;

    private String remark;
}
