package com.gear.mfg.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("finance_payment")
public class FinancePayment extends BaseEntity {

    private String paymentNo;

    private Integer paymentType;

    private Long payableId;

    private String payableNo;

    private String supplierName;

    private String paymentMethod;

    private String bankAccount;

    private BigDecimal amount;

    private LocalDate paymentDate;

    private String payer;

    private Integer status;

    private String remark;
}
