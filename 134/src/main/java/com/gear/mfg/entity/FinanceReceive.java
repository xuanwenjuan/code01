package com.gear.mfg.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("finance_receive")
public class FinanceReceive extends BaseEntity {

    private String receiveNo;

    private Integer receiveType;

    private Long receivableId;

    private String receivableNo;

    private String customerName;

    private String paymentMethod;

    private String bankAccount;

    private BigDecimal amount;

    private LocalDate receiveDate;

    private String receiver;

    private Integer status;

    private String remark;
}
