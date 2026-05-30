package com.evparts.entity;

import com.baomidou.mybatisplus.annotation.FieldFill;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@TableName("work_order")
public class WorkOrder {

    private Long id;
    private String orderNo;
    private Long productId;
    private Integer planQuantity;
    private Integer actualQuantity;
    private Integer badQuantity;
    private Integer priority;
    private String orderStatus;
    private LocalDate planStartDate;
    private LocalDate planEndDate;
    private LocalDateTime actualStartTime;
    private LocalDateTime actualEndTime;
    private String workshop;
    private String line;
    private Long operatorId;
    private String remark;
    private Long createBy;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    @TableLogic
    private Integer deleted;

    @TableField(exist = false)
    private String productName;

    @TableField(exist = false)
    private String productCode;

    @TableField(exist = false)
    private String specification;

    @TableField(exist = false)
    private String operatorName;

    @TableField(exist = false)
    private List<WorkOrderProcess> processes;

    @TableField(exist = false)
    private List<WorkOrderMaterial> materials;

}
