package com.radiator.management.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@TableName("stock_out_order")
public class StockOutOrder {
    @TableId(type = IdType.AUTO)
    private Long id;

    private String orderNo;

    private String orderType;

    private Long warehouseId;

    private Long locationId;

    private Long workOrderId;

    private String workOrderNo;

    private LocalDate planDate;

    private LocalDateTime actualDate;

    private BigDecimal totalAmount;

    private Integer totalQuantity;

    private String status;

    private Long approverId;

    private LocalDateTime approveTime;

    private String remark;

    @TableField(exist = false)
    private List<StockOutDetail> details;

    @TableField(fill = FieldFill.INSERT)
    private Long createBy;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    @TableLogic
    private Integer isDeleted;
}
