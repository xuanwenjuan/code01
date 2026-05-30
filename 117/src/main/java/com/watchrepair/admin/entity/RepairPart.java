package com.watchrepair.admin.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("repair_part")
public class RepairPart extends BaseEntity {

    private String partCode;

    private String partName;

    private String partType;

    private String origin;

    private String compatibleModels;

    private Integer quantity;

    private Integer warningThreshold;

    private BigDecimal unitPrice;

    private String storageLocation;

    private Integer moistureProof;

    private Integer status;

    private String remarks;

    @TableField(exist = false)
    private String statusDesc;
}