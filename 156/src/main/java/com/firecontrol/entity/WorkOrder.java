package com.firecontrol.entity;

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

    private String productCode;

    private String specification;

    private BigDecimal planQuantity;

    private BigDecimal actualQuantity;

    private BigDecimal qualifiedQuantity;

    private BigDecimal scrapQuantity;

    private Integer status;

    private Integer auditStatus;

    private Long auditUserId;

    private String auditUserName;

    private LocalDateTime auditTime;

    private String auditRemark;

    private Integer priority;

    private LocalDateTime planStartTime;

    private LocalDateTime planEndTime;

    private LocalDateTime actualStartTime;

    private LocalDateTime actualEndTime;

    private Long processUserId;

    private String processUserName;

    private Long productionUserId;

    private String productionUserName;

    private Long qualityUserId;

    private String qualityUserName;

    private String currentProcess;

    private Integer isEmergency;

    private Integer autoPaused;

    private String remark;
}
