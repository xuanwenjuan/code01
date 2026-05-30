package com.aquascape.vo;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class FinanceRecordVO {
    private Long id;
    private String recordNo;
    private Integer recordType;
    private String recordTypeName;
    private Long categoryId;
    private String categoryName;
    private BigDecimal amount;
    private Long relatedOrderId;
    private String relatedOrderNo;
    private LocalDate recordDate;
    private String operator;
    private String remark;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
