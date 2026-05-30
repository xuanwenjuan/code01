package com.fan.impeller.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("material_lock")
public class MaterialLock extends BaseEntity {
    private Long materialId;
    private String materialName;
    private String batchNo;
    private BigDecimal lockQuantity;
    private String lockType;
    private Long workOrderId;
    private String workOrderNo;
    private Long operatorId;
    private String operatorName;
    private LocalDateTime lockTime;
    private LocalDateTime expireTime;
    private Integer status;
    private String remark;
}
