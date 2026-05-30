package com.gear.mfg.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("stock_in")
public class StockIn extends BaseEntity {

    private String inNo;

    private Integer inType;

    private Long warehouseId;

    private String warehouseName;

    private Long orderId;

    private String orderNo;

    private String supplierName;

    private String contact;

    private String contactPhone;

    private LocalDate planDate;

    private LocalDate actualDate;

    private Integer status;

    private BigDecimal totalAmount;

    private String auditor;

    private LocalDate auditDate;

    private String remark;
}
