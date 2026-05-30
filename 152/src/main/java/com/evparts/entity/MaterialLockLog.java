package com.evparts.entity;

import com.baomidou.mybatisplus.annotation.FieldFill;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("material_lock_log")
public class MaterialLockLog {

    private Long id;
    private Long workOrderId;
    private Long workOrderMaterialId;
    private Long materialId;
    private Long materialStockId;
    private BigDecimal lockQuantity;
    private String lockType;
    private Integer status;
    private Long operatorId;
    private LocalDateTime releaseTime;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableLogic
    private Integer deleted;

}
