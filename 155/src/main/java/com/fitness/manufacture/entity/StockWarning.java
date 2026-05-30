package com.fitness.manufacture.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("stock_warning")
public class StockWarning {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String warningType;

    private Long materialId;

    private String materialName;

    private String batchNo;

    private BigDecimal currentQuantity;

    private BigDecimal warningQuantity;

    private LocalDate expiryDate;

    private Integer daysToExpiry;

    private Integer status;

    private Long handlerId;

    private LocalDateTime handleTime;

    private String handleRemark;

    private LocalDateTime createTime;
}
