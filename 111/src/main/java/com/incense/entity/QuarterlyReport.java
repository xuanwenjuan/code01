package com.incense.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("quarterly_report")
public class QuarterlyReport {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Integer reportYear;
    private Integer reportQuarter;
    private Long categoryId;
    private String categoryName;
    private String materialType;
    private BigDecimal totalUsage;
    private BigDecimal processCost;
    private BigDecimal lossCost;
    private BigDecimal salesRevenue;
    private BigDecimal totalCost;
    private BigDecimal profit;
    private LocalDateTime createTime;
}
