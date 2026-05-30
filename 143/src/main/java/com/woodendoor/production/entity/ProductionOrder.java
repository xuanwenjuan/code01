package com.woodendoor.production.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("production_order")
public class ProductionOrder extends BaseEntity {
    private String orderNo;
    private String customerName;
    private String customerPhone;
    private Long productCategoryId;
    private String productName;
    private BigDecimal width;
    private BigDecimal height;
    private Integer quantity;
    private Long materialId;
    private String materialName;
    private BigDecimal woodQuantity;
    private BigDecimal hardwareQuantity;
    private BigDecimal paintQuantity;
    private String woodType;
    private String color;
    private Integer currentProcess;
    private Integer status;
    private Integer isConfirmed;
    private LocalDateTime confirmTime;
    private Long confirmUserId;
    private String confirmUserName;
    private LocalDateTime planStartDate;
    private LocalDateTime planEndDate;
    private LocalDateTime actualStartDate;
    private LocalDateTime actualEndDate;
    private String remark;

    @TableField(exist = false)
    private List<OrderProcess> processList;
}