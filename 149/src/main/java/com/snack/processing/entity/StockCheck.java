package com.snack.processing.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("stock_check")
public class StockCheck extends BaseEntity {

    private String checkNo;
    private String warehouse;
    private LocalDate checkDate;
    private Integer checkType;
    private Integer status;
    private Integer totalCount;
    private Integer differenceCount;
    private BigDecimal totalDifferenceAmount;
    private String remark;

    @TableField(exist = false)
    private List<StockCheckDetail> details;
}
