package com.gear.mfg.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("stock_check")
public class StockCheck extends BaseEntity {

    private String checkNo;

    private Long warehouseId;

    private String warehouseName;

    private LocalDate checkDate;

    private Integer checkType;

    private Integer status;

    private String checker;

    private String auditor;

    private LocalDate auditDate;

    private Integer diffCount;

    private String remark;
}
