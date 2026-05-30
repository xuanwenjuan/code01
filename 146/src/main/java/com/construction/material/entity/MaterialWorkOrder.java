package com.construction.material.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@TableName("material_work_order")
public class MaterialWorkOrder {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String orderNo;

    private Integer orderType;

    private String orderTypeName;

    private String projectName;

    private String constructionTeam;

    private String teamLeader;

    private String teamLeaderPhone;

    private LocalDateTime planUseDate;

    private LocalDateTime actualUseDate;

    private LocalDateTime returnDate;

    private Integer status;

    private String statusName;

    private BigDecimal totalQuantity;

    private BigDecimal totalAmount;

    private BigDecimal usedQuantity;

    private BigDecimal returnedQuantity;

    private BigDecimal lostQuantity;

    private String auditor;

    private LocalDateTime auditTime;

    private String auditRemark;

    private String warehouseKeeper;

    private String remark;

    @TableField(exist = false)
    private List<WorkOrderDetail> details;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    @TableField(fill = FieldFill.INSERT)
    private Long createBy;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private Long updateBy;

    @TableLogic
    private Integer deleted;
}
