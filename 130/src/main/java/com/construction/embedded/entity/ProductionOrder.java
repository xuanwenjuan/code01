package com.construction.embedded.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("production_order")
public class ProductionOrder {
    @TableId(type = IdType.AUTO)
    private Long id;

    private String orderNo;

    private Long categoryId;

    private String productName;

    private String specification;

    private Integer planQuantity;

    private Integer actualQuantity;

    private Integer defectiveQuantity;

    private String status;

    private LocalDateTime planStartTime;

    private LocalDateTime actualStartTime;

    private LocalDateTime finishTime;

    private Integer timeoutHours;

    private Integer isTimeoutSuspended;

    private String remark;

    private Long createBy;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    @TableLogic
    private Integer deleted;
}
