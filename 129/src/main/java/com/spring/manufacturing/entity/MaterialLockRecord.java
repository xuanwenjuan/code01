package com.spring.manufacturing.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("material_lock_record")
public class MaterialLockRecord {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long materialId;

    private String materialName;

    private String materialBrand;

    private String batchNo;

    private Long workOrderId;

    private String workOrderNo;

    private BigDecimal lockQuantity;

    private BigDecimal unitPrice;

    private BigDecimal totalAmount;

    private Integer lockStatus;

    private Long lockOperatorId;

    private LocalDateTime lockTime;

    private Long releaseOperatorId;

    private LocalDateTime releaseTime;

    private String remark;
}