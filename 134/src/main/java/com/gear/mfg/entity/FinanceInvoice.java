package com.gear.mfg.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("finance_invoice")
public class FinanceInvoice extends BaseEntity {

    private String invoiceNo;

    private Integer invoiceType;

    private Long relatedId;

    private String relatedNo;

    private String partyName;

    private String taxNo;

    private String address;

    private String phone;

    private String bankName;

    private String bankAccount;

    private BigDecimal amount;

    private BigDecimal taxAmount;

    private BigDecimal totalAmount;

    private LocalDate invoiceDate;

    private LocalDate dueDate;

    private Integer status;

    private String drawer;

    private String auditor;

    private String remark;
}
