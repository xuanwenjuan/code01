package com.spindle.manage.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("inventory_lock_record")
public class InventoryLockRecord {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long orderId;

    private String orderNo;

    private Long materialId;

    private String materialName;

    private String batchNo;

    private BigDecimal lockQuantity;

    private Integer lockStatus;

    private LocalDateTime lockTime;

    private LocalDateTime releaseTime;

    private Long operatorId;

    private String operatorName;

    private String remark;

}
