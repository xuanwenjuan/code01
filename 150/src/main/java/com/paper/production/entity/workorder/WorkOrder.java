package com.paper.production.entity.workorder;

import com.baomidou.mybatisplus.annotation.TableName;
import com.paper.production.common.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("work_order")
public class WorkOrder extends BaseEntity {

    private String orderNo;
    private String orderName;
    private Long productCategoryId;
    private String productCategoryName;
    private String specification;
    private BigDecimal quantity;
    private BigDecimal finishedQuantity;
    private BigDecimal defectiveQuantity;
    private Integer status;
    private LocalDateTime planStartTime;
    private LocalDateTime planEndTime;
    private LocalDateTime actualStartTime;
    private LocalDateTime actualEndTime;
    private String productionLine;
    private String operator;
    private String supervisor;
    private Integer priority;
    private String customer;
    private String remark;
}
