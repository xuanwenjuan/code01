package com.spindle.manage.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("inventory_operation_log")
public class InventoryOperationLog {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long materialId;

    private String batchNo;

    private String operationType;

    private BigDecimal quantity;

    private BigDecimal beforeQuantity;

    private BigDecimal afterQuantity;

    private Long orderId;

    private String orderNo;

    private Long operatorId;

    private String operatorName;

    private String remark;

    private LocalDateTime createTime;

}
