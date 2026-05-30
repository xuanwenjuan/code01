package com.gear.mfg.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("stock_transfer")
public class StockTransfer extends BaseEntity {

    private String transferNo;

    private Long fromWarehouseId;

    private String fromWarehouseName;

    private Long toWarehouseId;

    private String toWarehouseName;

    private LocalDate planDate;

    private LocalDate actualDate;

    private Integer status;

    private BigDecimal totalQuantity;

    private String handler;

    private String auditor;

    private LocalDate auditDate;

    private String remark;
}
