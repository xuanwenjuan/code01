package com.aquascape.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("finance_record")
public class FinanceRecord extends BaseEntity {
    private String recordNo;
    private Integer recordType;
    private Long categoryId;
    private String categoryName;
    private BigDecimal amount;
    private Long relatedOrderId;
    private String relatedOrderNo;
    private LocalDate recordDate;
    private String operator;
    private String remark;
}
