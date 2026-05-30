package com.radiator.management.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("production_work_order")
public class ProductionWorkOrder {
    @TableId(type = IdType.AUTO)
    private Long id;

    private String orderNo;

    private Long radiatorCategoryId;

    private Integer quantity;

    private LocalDate planStartDate;

    private LocalDate planEndDate;

    private LocalDateTime actualStartDate;

    private LocalDateTime actualEndDate;

    private String status;

    private String currentProcess;

    private Long leaderId;

    private String remark;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    @TableLogic
    private Integer isDeleted;
}