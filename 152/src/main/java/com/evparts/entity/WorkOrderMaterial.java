package com.evparts.entity;

import com.baomidou.mybatisplus.annotation.FieldFill;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("work_order_material")
public class WorkOrderMaterial {

    private Long id;
    private Long workOrderId;
    private Long materialId;
    private Long materialStockId;
    private BigDecimal planQuantity;
    private BigDecimal actualQuantity;
    private BigDecimal lockedQuantity;
    private Integer lockStatus;
    private java.time.LocalDateTime lockTime;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;
    private String remark;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    @TableLogic
    private Integer deleted;

    @TableField(exist = false)
    private String materialName;

    @TableField(exist = false)
    private String materialCode;

    @TableField(exist = false)
    private String specification;

    @TableField(exist = false)
    private String unit;

    @TableField(exist = false)
    private String batchNo;

}
