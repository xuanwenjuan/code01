package com.gear.mfg.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("finance_receivable")
public class FinanceReceivable extends BaseEntity {

    private String receivableNo;

    private Integer receivableType;

    private Long orderId;

    private String orderNo;

    private String customerName;

    private String contact;

    private String contactPhone;

    private BigDecimal totalAmount;

    private BigDecimal paidAmount;

    private BigDecimal unpaidAmount;

    private LocalDate billDate;

    private LocalDate dueDate;

    private Integer status;

    private String remark;
}
